// @flow

import type { WebContents } from 'electron';
import { uniqueId } from './random';

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
}
