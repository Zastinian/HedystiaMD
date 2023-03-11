/**
 * Represents an button object to set in a sendMessage method
 */
exports.MessageButton = class MessageButton {
  /**
   * A `Partial` object is a representation of any existing object.
   * This object contains between 0 and all of the original objects parameters.
   * This is true regardless of whether the parameters are optional in the base object.
   * @typedef {Object} Partial
   */

  /**
   * Represents the possible options for a MessageButton
   * @property {string} [id] The custom of this button
   * @property {string} [label] The label of this button
   */

  constructor(id, label) {
    this.id = id;
    this.label = label;
    this.id_btn = "";
    this.label_btn = "";
  }

  /**
   * Sets the custom id of this button.
   * @param {string} id The custom id of the button
   * @returns {MessageButton}
   */
  setCustomId(id) {
    let id_btn = this.id_btn;
    if (typeof id === "string") {
      id_btn = id;
    } else {
      throw new TypeError("MessageButton id must be a string.");
    }
    this.id = id_btn;
    return this;
  }

  /**
   * Sets the label of this button.
   * @param {string} label The label of the button
   * @returns {MessageButton}
   */
  setLabel(label) {
    let label_btn = this.label_btn;
    if (typeof label === "string") {
      label_btn = label;
    } else {
      throw new TypeError("MessageButton label must be a string.");
    }
    this.label = label_btn;
    return this;
  }

  build() {
    return new MessageButton(id, label);
  }
};
