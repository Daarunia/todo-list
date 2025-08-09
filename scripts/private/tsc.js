import { exec } from 'child_process';
import pc from 'picocolors';

/**
 * Compile TypeScript in the given directory using tsc.
 * @param {string} directory - Path to the directory containing tsconfig.json
 * @returns {Promise<void>}
 */
export default function compile(directory) {
  return new Promise((resolve, reject) => {
    const tscProcess = exec('tsc', {
      cwd: directory,
    });

    tscProcess.stdout.on('data', data => {
      process.stdout.write(
        pc.yellow(`[tsc] `) + pc.white(data.toString())
      );
    });

    tscProcess.on('exit', exitCode => {
      if (exitCode > 0) {
        reject(exitCode);
      } else {
        resolve();
      }
    });
  });
}