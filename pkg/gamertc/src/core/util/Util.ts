export class Util {
  static randomHex(): number {
    const randomHexValue = Math.floor(Math.random() * 16777215);
    return parseInt(`0x${randomHexValue.toString(16).padStart(6, '0')}`);
  }  
}
