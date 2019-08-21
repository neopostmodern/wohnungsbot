// @flow

import { type WebContents } from 'electron';
import { uniqueId } from './random';
import { sleep } from './async';

export type ViewportSize = { height: number, width: number };

export default class ElectronUtils {
  webContents: WebContents;

  constructor(webContents: WebContents) {
    this.webContents = webContents;
  }

  // eslint-disable-next-line flowtype/no-weak-types
  async evaluate(javaScript: string, isUserGesture: boolean = false): any {
    const code = `new Promise((resolve, reject) => {
       try {
          resolve(${javaScript})
       } catch(err) {
          throw { name: err.name, message: err.message, stack: err.stack }
       }
    })`;

    try {
      return await this.webContents.executeJavaScript(code, isUserGesture);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error executing JavaScript in Electron:
[${error.name}] ${error.message}
${error.stack}

This is the code that caused the error:
${code}
// END OF CODE
`);
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
  }

  // returns a selector unique to the first element of passed in selector
  async selectorForVisibleElement(selector: string): Promise<string> {
    const id = uniqueId();
    await this.evaluate(
      `Array.from(document.querySelectorAll('${selector}'))
        .filter(element => element.offsetParent)[0].id = '${id}'`
    );
    return `#${id}`;
  }

  async elementExists(selector: string): Promise<boolean> {
    return this.evaluate(`document.querySelector('${selector}') !== null`);
  }

  async getValue(selector: string): Promise<string> {
    return this.evaluate(`document.querySelector('${selector}').value`);
  }

  // eslint-disable-next-line flowtype/no-weak-types
  async setValue(selector: string, value: any): Promise<string> {
    return this.evaluate(
      `document.querySelector('${selector}').value = ${JSON.stringify(value)}`
    );
  }

  async performPressKey(keyCode: string, modifiers?: Array<string>) {
    const eventDescription: {
      keyCode: string,
      modifiers?: Array<string>,
      charCode?: number
    } = { keyCode, modifiers };

    if (eventDescription.keyCode === 'Return') {
      eventDescription.keyCode = '\u000d';
      eventDescription.charCode = 13;
    }

    this.webContents.sendInputEvent({ ...eventDescription, type: 'keyDown' });

    await sleep(1 + Math.random() * 5);
    this.webContents.sendInputEvent({ ...eventDescription, type: 'char' });

    await sleep(10 + Math.random() * 50);
    this.webContents.sendInputEvent({ ...eventDescription, type: 'keyUp' });
  }

  async scrollBy(deltaX: number, deltaY: number) {
    return this.evaluate(`window.scrollBy(${deltaX}, ${deltaY})`);
  }

  async getBoundingBox(
    selector: string
  ): Promise<ClientRect & { x: number, y: number }> {
    return (this.evaluate(
      `JSON.parse(JSON.stringify(document.querySelector('${selector}').getBoundingClientRect()))`
      // eslint-disable-next-line flowtype/no-weak-types
    ): any);
  }

  async getViewportSize(): Promise<ViewportSize> {
    return this.evaluate(
      `JSON.parse(JSON.stringify({ height: window.innerHeight, width: window.innerWidth }))`
    );
  }

  async isElementInViewport(
    selector: string,
    mustIncludeTop: boolean = true,
    mustIncludeBottom: boolean = false
  ): Promise<boolean> {
    try {
      if (!(await this.elementExists(selector))) {
        console.log(
          `isElementInViewport(${selector}) called on non-existent element`
        );
        return false;
      }

      const elementBoundingBox = await this.getBoundingBox(selector);
      const viewportSize = await this.getViewportSize();

      if (
        (elementBoundingBox.top < 0 ||
          elementBoundingBox.top > viewportSize.height) &&
        (elementBoundingBox.bottom < 0 ||
          elementBoundingBox.bottom > viewportSize.height)
      ) {
        return false;
      }

      return (
        (!mustIncludeTop ||
          (elementBoundingBox.top > 0 &&
            elementBoundingBox.top < viewportSize.height)) &&
        (!mustIncludeBottom ||
          (elementBoundingBox.bottom > 0 &&
            elementBoundingBox.bottom < viewportSize.height))
      );
    } catch (error) {
      console.error(`isElementInViewport(${selector}) failed.`);
      return false;
    }
  }
}
