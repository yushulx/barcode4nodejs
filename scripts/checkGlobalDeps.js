const { execSync } = require('child_process');

function isPackageInstalledGlobally(packageName) {
    try {
        execSync(`npm ls -g ${packageName}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function installPackageGlobally(packageName) {
    console.log(`Installing ${packageName} globally...`);
    execSync(`npm install -g ${packageName}`, { stdio: 'inherit' });
}

if (!isPackageInstalledGlobally('node-gyp')) {
    installPackageGlobally('node-gyp');
}

if (!isPackageInstalledGlobally('node-addon-api')) {
    installPackageGlobally('node-addon-api');
}
