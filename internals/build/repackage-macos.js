const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.default = async function afterAllArtifactBuild (context) {
  await Promise.all(Array.from(context.platformToTargets).map(([platform]) => {
      if (platform.nodeName !== 'darwin') {
        return Promise.resolve();
      }

      const packagedName = context.artifactPaths.find(path => path.includes('mac.tar.gz'));
      return exec(`tar czpf "${packagedName}" "${context.configuration.productName}.app"`, {
        cwd: path.join(context.outDir, 'mac')
      });
    })
  );
};
