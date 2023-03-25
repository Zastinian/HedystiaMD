/**
 * @description Execute the code after a while
 * @author Zastinian
 * @param {Number} delay
 * @example
 * async function async() {
 *  await wait(2000)
 *  console.log("Something")
 * }
 * async()
 * @returns {void} void
 */

module.exports = (delay = 0) => new Promise((resolve) => setTimeout(resolve, delay));
