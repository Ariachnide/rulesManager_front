# RulesManager - frontend app - React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
This app is currently running [in Github Pages](https://ariachnide.github.io/rulesManager_front/).
You may find the backend app, made with node, express and Sequelize, [here](https://github.com/Ariachnide/rulesManager_back).

## Download and setup this repository locally

Do not forget to check if node.js and npm on your computer before trying to work on this app. This app has been developped with the following versions:
- npm: 10.9.4
- nvm: 0.39.2
- node: v22.21.1

After you cloned this repo with command "git clone", go in root folder of the repository in Command Line Interface, and run this command in order to set up dependencies:
```
npm install
```

This should take a few moments. After that, stay in the root folder and create a ".env" file, where you will be able to set up your environment variables.
At that point, only one is necessary:
```
VITE_API_BASE_URL=https://rulesmanager-back.onrender.com/
```

This url will allow you to access [the current API](https://rulesmanager-back.onrender.com/). The page may take a while to appear, in case it has not been reached in a while. Just wait a couple of minutes and it will display.

When you will create new environment variables, do not forget to initiate their name with "VITE_", otherwise they cannot be recognized by Vite.

## Work in development environment

Use this command in order to run development environment:
```
npm run dev
```

This environment will run on localhost, on port 5173 by default.

## Deploy on Github Pages

In order to update github pages, run the following command:
```
npm run deploy
```

If you want to deploy it on another account, you will have to go on vite.config.js, change "base" property and set its value to
```
https://{github_account_name}.github.io/{project_name}/
```

The project name so far is rulesManager_front

Deployment on Github Pages may take a few minutes to go live. It will be deployed on a specific github branch, which is called gh-pages
