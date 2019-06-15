// @flow

import { type WebContents } from 'electron';
import { uniqueId } from './random';
import { sleep } from './async';

export default class ElectronUtils {
  webContents: WebContents;

  constructor(webContents: WebContents) {
    this.webContents = webContents;
  }

  async execute(javaScript: string) {
    const code = `new Promise((resolve, reject) => {
       try {
          resolve(${javaScript})
       } catch(err) {
          throw { name: err.name, message: err.message, stack: err.stack }
       }
    })`;

    try {
      return await this.webContents.executeJavaScript(code);
    } catch (error) {
      console.error(`Error executing JavaScript in Electron:
[${error.name}] ${error.message}
${error.stack}

This is the code that caused the error:
${code}
// END OF CODE
`);
      throw error;
    }
  }

  // returns a selector unique to the first element of passed in selector
  async selectorForVisibleElement(selector: string): Promise<string> {
    const id = uniqueId();
    await this.execute(
      `Array.from(document.querySelectorAll('${selector}'))
        .filter(element => element.offsetParent)[0].id = '${id}'`
    );
    return `#${id}`;
  }

  async elementExists(selector: string): Promise<boolean> {
    return this.execute(`document.querySelector('${selector}') !== null`);
  }

  async getValue(selector: string): Promise<string> {
    return this.execute(`document.querySelector('${selector}').value`);
  }

  async performPressKey(keyCode: string, modifiers?: Array<string>) {
    const eventDescription = { keyCode, modifiers };

    this.webContents.sendInputEvent(
      Object.assign({}, eventDescription, {
        type: 'keyDown'
      })
    );

    await sleep(1 + Math.random() * 5);
    this.webContents.sendInputEvent(
      Object.assign({}, eventDescription, {
        type: 'char'
      })
    );

    await sleep(10 + Math.random() * 50);
    this.webContents.sendInputEvent(
      Object.assign({}, eventDescription, {
        type: 'keyUp'
      })
    );
  }

  async scrollBy(deltaX: number, deltaY: number) {
    return this.execute(`window.scrollBy(${deltaX}, ${deltaY})`);
  }
}
