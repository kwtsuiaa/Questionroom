questionsJs
====

Inspired by Firebase & AngularJS TodoMVC Example

#### Configuration
Please change this firebase URL to your app URL. Otherwise, it won't work.

Change this file: /js/controllers/todoCtrl.js

var url = "https://classquestion.firebaseio.com/" + roomId + "/questions/";

#### How to install `node` and `npm`
- [Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
- [Mac](http://blog.teamtreehouse.com/install-node-js-npm-mac)
- [Linux](http://blog.teamtreehouse.com/install-node-js-npm-linux)

Local webserver
----

```
$ cd questionsJS (working directory)
$ sudo npm install -g karma
$ npm start
```

Note: you might encounter errors when installing karma. Scroll down to the "Trouble Shooting" section for a solution.

Unit Testing with [Karma](http://karma-runner.github.io/0.13/index.html)
----

#### Installation
```
$ sudo npm install -g karma karma-cli karma-coverage karma-chrome-launcher karma-jasmine
```

Test case: `test/unit/*`
```
$ karma start karma.conf.js
```

End-to-End Testing with [Protractor](http://www.protractortest.org/#/)
----

#### Installation
````
sudo npm install -g protractor
webdriver-manager update & webdriver-manager start
````

Test case: `test/e2e/*`
```
$ protractor protractor.conf.js
```

Trouble Shooting
----

#### Error installing Karma

You might encounter **one of** the following errors:

```
gyp ERR! stack Error: Can't find Python executable "python", you can set the PYTHON env variable.
gyp ERR! stack Error: Python executable "C:\Python34\python.exe" is v3.4.3, which is not supported by gyp.
```

Both can be solved by installing a [Python 2.7.10](https://www.python.org/downloads/). For windows users, **DO NOT** choose "Add python.exe to Path" during installation (this is **by default**, meaning that you can just keep clicking *Next*).

After the installation, add an environment variable called PYTHON, whose value is the path to Python 2.7 executable. For windows users, hit ```WinKey + R``` (open the Run dialog), then paste ```rundll32 sysdm.cpl,EditEnvironmentVariables``` and hit enter. Click ```New```, and type ```PYTHON``` for variable name, and ```C:\Python27\python.exe``` for variable value (assuming that you installs Python 2.7 to the default location). Reopen your command prompts for the changes to take effect.
