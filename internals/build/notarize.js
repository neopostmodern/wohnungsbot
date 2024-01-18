require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  const appleId = process.env.APPLEID;
  const appleIdPassword = process.env.APPLEID_PASSWORD;

  // eslint-disable-next-line consistent-return
  return notarize({
    appBundleId: 'com.neopostmodern.wohnung',
    appPath: `${appOutDir}/${appName}.app`,
    appleId,
    appleIdPassword
  });
};
