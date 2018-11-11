const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const pkg = require('./package.json');

const vueCliService = path.join(__dirname, 'node_modules', '.bin', 'vue-cli-service');
const libName = pkg.libname;

const runBuild = (name, dest, entry) => new Promise((resolve, reject) => {
  const execArgs = [
    'build',
    '--mode',
    'production',
    '--target',
    'lib',
    '--name',
    name,
    '--dest',
    dest,
    entry,
  ];

  exec(`${vueCliService} ${execArgs.join(' ')}`, (err, stdout) => {
    if (err) {
      reject(err);
    } else {
      process.stdout.write(stdout);
      resolve();
    }
  });
});

async function build() {
  // build main
  await runBuild(
    libName,
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'src', 'components', 'entry.js')
  );
  // rename main lib
  fs.rename(
    path.join(__dirname, 'dist', `${libName}.common.js`),
    path.join(__dirname, 'dist', 'index.js'),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`    Renamed ${libName}.common.js to index.js`);
      }
    }
  );
  // build individual components
  glob(
    `${path.join(__dirname, 'src', 'components')}/*.vue`, null,
    (er, files) => {
      files.forEach(async (file) => {
        const componentName = path.basename(file, '.vue');
        const componentLibName = `${libName}${componentName}`;
        await runBuild(
          componentLibName,
          path.join(__dirname, 'dist', componentLibName),
          file
        );
        // rename component
        fs.rename(
          path.join(__dirname, 'dist', componentLibName, `${componentLibName}.common.js`),
          path.join(__dirname, 'dist', componentLibName, 'index.js'),
          (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log(`    Renamed ${componentLibName}.common.js to index.js`);
            }
          }
        );
      });
    }
  );
}

build().catch(console.error);
