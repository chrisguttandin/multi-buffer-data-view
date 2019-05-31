const { execSync } = require('child_process');
const { version } = require('process');

// eslint-disable-next-line padding-line-between-statements
const replaceNodeVersion = (grunt, match) => {
    try {
        const stdout = execSync(`curl --compressed --location --silent https://hub.docker.com/v2/repositories/library/node/tags/${ version.slice(1) }`);
        const tagName = JSON.parse(stdout.toString()).name;

        if (tagName === version.slice(1)) {
            return match.replace(/[0-9]+\.[0-9]+\.[0-9]+/, tagName);
        }
    } catch (err) {
        grunt.fail.warn('Updating the solution stack failed.');
    }

    return match;
};

module.exports = (grunt) => {
    return {
        'node-version-in-package-json': {
            files: {
                'package.json': [
                    'package.json'
                ]
            },
            options: {
                patterns: [ {
                    match: /"node":\s">=[0-9]+\.[0-9]+\.[0-9]+"/g,
                    replacement: (match) => replaceNodeVersion(grunt, match)
                } ]
            }
        }
    };
};
