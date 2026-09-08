#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { syncSkills } = require('../lib/sync');
const pkg = require('../package.json');

const program = new Command();

program.name('yss-skills').description('Manage and sync AI skills').version(pkg.version);

program
  .command('sync')
  .description('Sync skills from the central repository to local .agents/skills')
  .option('-f, --force', 'Force overwrite existing skills', false)
  .option('-a, --all', 'Sync ALL mixed skills (including library maintainer skills)', false)
  .option('--local', 'Use packages/skills from the current yss-ui monorepo')
  .option('-g, --global', 'Also sync skills to configured user-level AI IDE directories')
  .option('--global-only', 'Only sync user-level AI IDE directories (implies --global)')
  .option('--no-links', 'Skip creating symbolic links for other IDEs')
  .action(async options => {
    try {
      await syncSkills(options);
    } catch (error) {
      console.error(chalk.red('Error syncing skills:'), error.message);
      process.exit(1);
    }
  });

program.parse();
