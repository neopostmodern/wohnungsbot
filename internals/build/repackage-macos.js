const path = require('path');
const tar = require('tar');

exports.default = async function afterAllArtifactBuild (context) {
  await Promise.all(Array.from(context.platformToTargets).map(([platform]) => {
      if (platform.nodeName !== 'darwin') {
        return Promise.resolve();
      }
      return tar.create({
          gzip: true,
          cwd: path.join(context.outDir, 'mac'),
          file: context.artifactPaths.find(path => path.includes('mac.tar.gz'))
        },
        [context.configuration.productName + '.app']
      );
    })
  );
};
