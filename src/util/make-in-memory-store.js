const { proto } = require("baileys");
const { DEFAULT_CONNECTION_CONFIG } = require("baileys");
const { LabelAssociationType } = require("./LabelAssociation");
const { md5, toNumber, updateMessageWithReaction, updateMessageWithReceipt } = require("baileys");
const { jidDecode, jidNormalizedUser } = require("baileys");
const makeOrderedDictionary = require("./make-ordered-dictionary");
const ObjectRepository = require("./object-repository");

const waChatKey = (pin) => ({
  key: (c) =>
    (pin ? (c.pinned ? "1" : "0") : "") +
    (c.archived ? "0" : "1") +
    (c.conversationTimestamp ? c.conversationTimestamp.toString(16).padStart(8, "0") : "") +
    c.id,
  compare: (k1, k2) => k2.localeCompare(k1),
});

const waMessageID = (m) => m.key.id || "";

const waLabelAssociationKey = {
  key: (la) =>
    la.type === LabelAssociationType.Chat
      ? la.chatId + la.labelId
      : la.chatId + la.messageId + la.labelId,
  compare: (k1, k2) => k2.localeCompare(k1),
};

const makeMessagesDictionary = () => makeOrderedDictionary(waMessageID);

// Clase simple para reemplazar KeyedDB
class SimpleKeyedCollection {
  constructor(keyConfig, idExtractor) {
    this.items = new Map();
    this.keyConfig = keyConfig;
    this.idExtractor = idExtractor;
  }

  upsert(...items) {
    const added = [];
    for (const item of items) {
      const id = this.idExtractor ? this.idExtractor(item) : item.id;
      if (!this.items.has(id)) {
        added.push(item);
      }
      this.items.set(id, item);
    }
    return added;
  }

  insertIfAbsent(...items) {
    const added = [];
    for (const item of items) {
      const id = this.idExtractor ? this.idExtractor(item) : item.id;
      if (!this.items.has(id)) {
        this.items.set(id, item);
        added.push(item);
      }
    }
    return added;
  }

  get(id) {
    return this.items.get(id);
  }

  update(id, updateFn) {
    const item = this.items.get(id);
    if (item) {
      updateFn(item);
      return true;
    }
    return false;
  }

  delete(item) {
    const id = this.idExtractor ? this.idExtractor(item) : item.id;
    return this.items.delete(id);
  }

  deleteById(id) {
    return this.items.delete(id);
  }

  clear() {
    this.items.clear();
  }

  filter(filterFn) {
    const filtered = new SimpleKeyedCollection(this.keyConfig, this.idExtractor);
    for (const [id, item] of this.items) {
      if (filterFn(item)) {
        filtered.items.set(id, item);
      }
    }
    return {
      all: () => Array.from(filtered.items.values()),
    };
  }

  all() {
    return Array.from(this.items.values());
  }

  values() {
    return Array.from(this.items.values());
  }

  keys() {
    return Array.from(this.items.keys());
  }

  size() {
    return this.items.size;
  }
}

module.exports = (config) => {
  const socket = config.socket;
  const chatKey = config.chatKey || waChatKey(true);
  const labelAssociationKey = config.labelAssociationKey || waLabelAssociationKey;
  const logger =
    config.logger || DEFAULT_CONNECTION_CONFIG.logger.child({ stream: "in-mem-store" });

  // Reemplazar KeyedDB con SimpleKeyedCollection
  const chats = new SimpleKeyedCollection(chatKey, (c) => c.id);
  const messages = {};
  const contacts = {};
  const groupMetadata = {};
  const presences = {};
  const state = { connection: "close" };
  const labels = new ObjectRepository();
  const labelAssociations = new SimpleKeyedCollection(labelAssociationKey, labelAssociationKey.key);

  const assertMessageList = (jid) => {
    if (!messages[jid]) {
      messages[jid] = makeMessagesDictionary();
    }

    return messages[jid];
  };

  const contactsUpsert = (newContacts) => {
    const oldContacts = new Set(Object.keys(contacts));
    for (const contact of newContacts) {
      oldContacts.delete(contact.id);
      contacts[contact.id] = Object.assign(contacts[contact.id] || {}, contact);
    }

    return oldContacts;
  };

  const labelsUpsert = (newLabels) => {
    for (const label of newLabels) {
      labels.upsertById(label.id, label);
    }
  };

  const getValidContacts = () => {
    for (const contact of Object.keys(contacts)) {
      if (contact.indexOf("@") < 0) {
        delete contacts[contact];
      }
    }

    return Object.keys(contacts);
  };

  /**
   * binds to a BaileysEventEmitter.
   * It listens to all events and constructs a state that you can query accurate data from.
   * Eg. can use the store to fetch chats, contacts, messages etc.
   * @param ev typically the event emitter from the socket connection
   */
  const bind = (ev) => {
    ev.on("connection.update", (update) => {
      Object.assign(state, update);
    });

    ev.on(
      "messaging-history.set",
      ({ chats: newChats, contacts: newContacts, messages: newMessages, isLatest, syncType }) => {
        if (syncType === proto.HistorySync.HistorySyncType.ON_DEMAND) {
          return; // FOR NOW,
          //TODO: HANDLE
        }
        if (isLatest) {
          chats.clear();

          for (const id in messages) {
            delete messages[id];
          }
        }

        const chatsAdded = chats.insertIfAbsent(...newChats).length;
        logger.debug({ chatsAdded }, "synced chats");

        const oldContacts = contactsUpsert(newContacts);
        if (isLatest) {
          for (const jid of oldContacts) {
            delete contacts[jid];
          }
        }

        logger.debug(
          { deletedContacts: isLatest ? oldContacts.size : 0, newContacts },
          "synced contacts",
        );

        for (const msg of newMessages) {
          const jid = msg.key.remoteJid;
          const list = assertMessageList(jid);
          list.upsert(msg, "prepend");
        }

        logger.debug({ messages: newMessages.length }, "synced messages");
      },
    );

    ev.on("contacts.upsert", (contacts) => {
      contactsUpsert(contacts);
    });

    ev.on("contacts.update", async (updates) => {
      for (const update of updates) {
        let contact;
        if (contacts[update.id]) {
          contact = contacts[update.id];
        } else {
          const validContacts = getValidContacts();
          const contactHashes = validContacts.map((contactId) => {
            const { user } = jidDecode(contactId);
            return [
              contactId,
              md5(Buffer.from(`${user}WA_ADD_NOTIF`, "utf8"))
                .toString("base64")
                .slice(0, 3),
            ];
          });
          contact = contacts[contactHashes.find(([, b]) => b === update.id)?.[0] || ""]; // find contact by attrs.hash, when user is not saved as a contact
        }

        if (contact) {
          if (update.imgUrl === "changed") {
            contact.imgUrl = socket ? await socket?.profilePictureUrl(contact.id) : undefined;
          } else if (update.imgUrl === "removed") {
            contact.imgUrl = undefined;
          }
          Object.assign(contacts[contact.id], contact);
        } else {
          logger.debug({ update }, "got update for non-existant contact");
        }
      }
    });
    ev.on("chats.upsert", (newChats) => {
      chats.upsert(...newChats);
    });
    ev.on("chats.update", (updates) => {
      for (let update of updates) {
        const result = chats.update(update.id, (chat) => {
          if (update.unreadCount > 0) {
            update = { ...update };
            update.unreadCount = (chat.unreadCount || 0) + update.unreadCount;
          }

          Object.assign(chat, update);
        });
        if (!result) {
          logger.debug({ update }, "got update for non-existant chat");
        }
      }
    });

    ev.on("labels.edit", (label) => {
      if (label.deleted) {
        return labels.deleteById(label.id);
      }

      // WhatsApp can store only up to 20 labels
      if (labels.count() < 20) {
        return labels.upsertById(label.id, label);
      }

      logger.error("Labels count exceed");
    });

    ev.on("labels.association", ({ type, association }) => {
      switch (type) {
        case "add":
          labelAssociations.upsert(association);
          break;
        case "remove":
          labelAssociations.delete(association);
          break;
        default:
          console.error(`unknown operation type [${type}]`);
      }
    });

    ev.on("presence.update", ({ id, presences: update }) => {
      presences[id] = presences[id] || {};
      Object.assign(presences[id], update);
    });
    ev.on("chats.delete", (deletions) => {
      for (const item of deletions) {
        if (chats.get(item)) {
          chats.deleteById(item);
        }
      }
    });
    ev.on("messages.upsert", ({ messages: newMessages, type }) => {
      switch (type) {
        case "append":
        case "notify":
          for (const msg of newMessages) {
            const jid = jidNormalizedUser(msg.key.remoteJid);
            const list = assertMessageList(jid);
            list.upsert(msg, "append");

            if (type === "notify") {
              if (!chats.get(jid)) {
                ev.emit("chats.upsert", [
                  {
                    id: jid,
                    conversationTimestamp: toNumber(msg.messageTimestamp),
                    unreadCount: 1,
                  },
                ]);
              }
            }
          }

          break;
      }
    });
    ev.on("messages.update", (updates) => {
      for (const { update, key } of updates) {
        const list = assertMessageList(jidNormalizedUser(key.remoteJid));
        if (update?.status) {
          const listStatus = list.get(key.id)?.status;
          if (listStatus && update?.status <= listStatus) {
            logger.debug({ update, storedStatus: listStatus }, "status stored newer then update");
            update.status = undefined;
            logger.debug({ update }, "new update object");
          }
        }

        const result = list.updateAssign(key.id, update);
        if (!result) {
          logger.debug({ update }, "got update for non-existent message");
        }
      }
    });
    ev.on("messages.delete", (item) => {
      if ("all" in item) {
        const list = messages[item.jid];
        list?.clear();
      } else {
        const jid = item.keys[0].remoteJid;
        const list = messages[jid];
        if (list) {
          const idSet = new Set(item.keys.map((k) => k.id));
          list.filter((m) => !idSet.has(m.key.id));
        }
      }
    });

    ev.on("groups.update", (updates) => {
      for (const update of updates) {
        const id = update.id;
        if (groupMetadata[id]) {
          Object.assign(groupMetadata[id], update);
        } else {
          logger.debug({ update }, "got update for non-existant group metadata");
        }
      }
    });

    ev.on("group-participants.update", ({ id, participants, action }) => {
      const metadata = groupMetadata[id];
      if (metadata) {
        switch (action) {
          case "add":
            metadata.participants.push(
              ...participants.map((id) => ({ id, isAdmin: false, isSuperAdmin: false })),
            );
            break;
          case "demote":
          case "promote":
            for (const participant of metadata.participants) {
              if (participants.includes(participant.id)) {
                participant.isAdmin = action === "promote";
              }
            }

            break;
          case "remove":
            metadata.participants = metadata.participants.filter(
              (p) => !participants.includes(p.id),
            );
            break;
        }
      }
    });

    ev.on("message-receipt.update", (updates) => {
      for (const { key, receipt } of updates) {
        const obj = messages[key.remoteJid];
        const msg = obj?.get(key.id);
        if (msg) {
          updateMessageWithReceipt(msg, receipt);
        }
      }
    });

    ev.on("messages.reaction", (reactions) => {
      for (const { key, reaction } of reactions) {
        const obj = messages[key.remoteJid];
        const msg = obj?.get(key.id);
        if (msg) {
          updateMessageWithReaction(msg, reaction);
        }
      }
    });
  };

  const toJSON = () => ({
    chats: chats.values(),
    contacts,
    messages,
    labels,
    labelAssociations: labelAssociations.values(),
  });

  const fromJSON = (json) => {
    chats.upsert(...json.chats);
    labelAssociations.upsert(...(json.labelAssociations || []));
    contactsUpsert(Object.values(json.contacts));
    labelsUpsert(Object.values(json.labels || {}));
    for (const jid in json.messages) {
      const list = assertMessageList(jid);
      for (const msg of json.messages[jid]) {
        list.upsert(proto.WebMessageInfo.fromObject(msg), "append");
      }
    }
  };

  return {
    chats,
    contacts,
    messages,
    groupMetadata,
    state,
    presences,
    labels,
    labelAssociations,
    bind,
    /** loads messages from the store, if not found -- uses the legacy connection */
    loadMessages: async (jid, count, cursor) => {
      const list = assertMessageList(jid);
      const mode = !cursor || "before" in cursor ? "before" : "after";
      const cursorKey = cursor ? ("before" in cursor ? cursor.before : cursor.after) : undefined;
      const cursorValue = cursorKey ? list.get(cursorKey.id) : undefined;

      let messages;
      if (list && mode === "before" && (!cursorKey || cursorValue)) {
        if (cursorValue) {
          const msgIdx = list.array.findIndex((m) => m.key.id === cursorKey?.id);
          messages = list.array.slice(0, msgIdx);
        } else {
          messages = list.array;
        }

        const diff = count - messages.length;
        if (diff < 0) {
          messages = messages.slice(-count); // get the last X messages
        }
      } else {
        messages = [];
      }

      return messages;
    },
    /**
     * Get all available labels for profile
     *
     * Keep in mind that the list is formed from predefined tags and tags
     * that were "caught" during their editing.
     */
    getLabels: () => {
      return labels;
    },

    /**
     * Get labels for chat
     *
     * @returns Label IDs
     **/
    getChatLabels: (chatId) => {
      return labelAssociations.filter((la) => la.chatId === chatId).all();
    },

    /**
     * Get labels for message
     *
     * @returns Label IDs
     **/
    getMessageLabels: (messageId) => {
      const associations = labelAssociations.filter((la) => la.messageId === messageId).all();

      return associations.map(({ labelId }) => labelId);
    },
    loadMessage: async (jid, id) => messages[jid]?.get(id),
    mostRecentMessage: async (jid) => {
      const message = messages[jid]?.array.slice(-1)[0];
      return message;
    },
    fetchImageUrl: async (jid, sock) => {
      const contact = contacts[jid];
      if (!contact) {
        return sock?.profilePictureUrl(jid);
      }

      if (typeof contact.imgUrl === "undefined") {
        contact.imgUrl = await sock?.profilePictureUrl(jid);
      }

      return contact.imgUrl;
    },
    fetchGroupMetadata: async (jid, sock) => {
      if (!groupMetadata[jid]) {
        const metadata = await sock?.groupMetadata(jid);
        if (metadata) {
          groupMetadata[jid] = metadata;
        }
      }

      return groupMetadata[jid];
    },
    fetchMessageReceipts: async ({ remoteJid, id }) => {
      const list = messages[remoteJid];
      const msg = list?.get(id);
      return msg?.userReceipt;
    },
    toJSON,
    fromJSON,
    writeToFile: (path) => {
      const { writeFileSync } = require("fs");
      writeFileSync(path, JSON.stringify(toJSON()));
    },
    readFromFile: (path) => {
      const { readFileSync, existsSync } = require("fs");
      if (existsSync(path)) {
        logger.debug({ path }, "reading from file");
        const jsonStr = readFileSync(path, { encoding: "utf-8" });
        const json = JSON.parse(jsonStr);
        fromJSON(json);
      }
    },
  };
};
