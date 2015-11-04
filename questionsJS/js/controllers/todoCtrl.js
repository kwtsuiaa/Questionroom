/*global todomvc, angular, Firebase */
'use strict';



/**
* The main controller for the app. The controller:
* - retrieves and persists the model via the $firebaseArray service
* - exposes the model to the template and provides event handlers
*/
todomvc.controller('TodoCtrl',
['$scope', '$location', '$firebaseArray', '$sce', '$localStorage', '$window', '$timeout',
function ($scope, $location, $firebaseArray, $sce, $localStorage, $window, $timeout) {

	// set local storage
	$scope.$storage = $localStorage;

	var scrollCountDelta = 10;
	$scope.maxQuestion = scrollCountDelta;

	var splits = $location.path().trim().split("/");
	var roomId = angular.uppercase(splits[1]);
	if (!roomId || roomId.length === 0) {
		roomId = "TEST";
	}

	// TODO: Please change this URL for your app
	var firebaseURL = "https://comp3111-qroom.firebaseio.com/";

	$scope.roomId = roomId;
	var url = firebaseURL + roomId + "/questions/";
	var echoRef = new Firebase(url);

	var query = echoRef.orderByChild("order");
	// Should we limit?
	//.limitToFirst(1000);
	$scope.todos = $firebaseArray(query);

	//$scope.input.wholeMsg = '';
	$scope.editedTodo = null;

	$scope.timeAgo = function(past){
		var now = new Date().getTime();
		var ts= past;
		var delta = (now-ts)/1000;
		var interval= delta-delta%1;

		if(interval<60){
			return"just now";
		}
		else if(interval>59 && interval<3600){
			var x= interval/60;
			var min = x-x%1;
			if(min==1){return min+" min"+" ago";}
			else
				return min+" mins"+" ago";
		}
		else if(interval>3599 && interval<86400){
			var x= interval/3600;
			var hr = x-x%1;
			if(hr==1){return hr+" hour"+" ago";}
			else
				return hr+" hours"+" ago";
		}
		else if(interval>86399 && interval<604800){
			var x= interval/86400;
			var day = x-x%1;
			if(day==1){return day+" day"+" ago";}
			else
				return day+" days"+" ago";
		}
		else{
			return new Date(past).toString();
		}
  }

    // pre-precessing for collection
    $scope.$watchCollection('todos', function () {
        var total = 0;
        var remaining = 0;
        $scope.todos.forEach(function (todo) {
            // Skip invalid entries so they don't break the entire app.
            if (!todo || !todo.head ) {
                return;
            }

            total++;
            if (todo.completed === false) {
                remaining++;
            }
        });

        $scope.totalCount = total;
        $scope.remainingCount = remaining;
        $scope.completedCount = total - remaining;
        $scope.allChecked = remaining === 0;
        $scope.absurl = $location.absUrl();
    }, true);

    //filter words detector, return true is detected
    $scope.filterWord = function($string) {
        var str = $string;
        //filtered words library
        var filterWords = ["shit", "fuck", "asshole","diu","wtf"];
        //"i" is to ignore case and "g" for global
        var wRegExp = new RegExp(filterWords.join("|"), "gi");
        return wRegExp.test(str);
    };

    // Get the first sentence and rest
    $scope.getFirstAndRestSentence = function($string) {
        var head = $string;
        var desc = '';

        var separators = [". ", "? ", "! ", '\n'];

        var firstIndex = -1;
        for (var i in separators) {
            var index = $string.indexOf(separators[i]);
            if (index == -1) continue;
            if (firstIndex == -1) {firstIndex = index; continue;}
            if (firstIndex > index) {firstIndex = index;}
        }

        if (firstIndex !=-1) {
            head = $string.slice(0, firstIndex+1);
            desc = $string.slice(firstIndex+1);
        }
        return [head, desc];
    };

    $scope.addTodo = function () {
        var newTodo = $scope.input.wholeMsg.trim();
        var todoID = $scope.input.email;
        var tag = "";

        if (!newTodo.length) {
            return;
        }

        if (newTodo.indexOf("#")!=-1) {
            var values = newTodo.split("#");
            tag = values[1];
            newTodo = values[0];
        }

        var firstAndLast = $scope.getFirstAndRestSentence(newTodo);
        var head = firstAndLast[0];
        var desc = firstAndLast[1];

        $scope.todos.$add({
            wholeMsg: newTodo,
            head: head,
            desc: desc,
            trustedDesc: Autolinker.link(desc, {newWindow: false, stripPrefix: false}),
            completed: false,
            timestamp: new Date().getTime(),
            tags: tag,
            email: todoID,
            echo: 0,
            order: 0,
            newQuestion: true
        });
        
        // remove the posted question and email address in the input
        $scope.input.wholeMsg = '';
        $scope.input.email = '';
        // set time interval to 5s to prevent user keep posting questions
        $scope.setPostTimeInterval();
    };

    $scope.editTodo = function (todo) {
        $scope.editedTodo = todo;
        $scope.originalTodo = angular.extend({}, $scope.editedTodo);
    };

    //for like button
    $scope.addEcho = function (todo) {
        $scope.editedTodo = todo;
        if ($scope.$storage[todo.$id]=="echoed")
        {
            todo.echo = todo.echo - 1;
            todo.order = todo.order +1;
            $scope.$storage[todo.$id] = "";
        }
        else if ($scope.$storage[todo.$id]=="d_echoed")
        {
            todo.echo = todo.echo + 2;
            todo.order = todo.order -2;
            $scope.$storage[todo.$id] = "echoed";
        } else {
            todo.echo = todo.echo + 1;
            todo.order = todo.order -1;
            $scope.$storage[todo.$id] = "echoed";
        }
        $scope.todos.$save(todo);
    };

    //for dislike button
    $scope.subEcho = function (todo) {
        $scope.editedTodo = todo;
        if ($scope.$storage[todo.$id]=="d_echoed")
        {
            todo.echo = todo.echo + 1;
            todo.order = todo.order -1;
            $scope.$storage[todo.$id] = "";
        }
        else if ($scope.$storage[todo.$id]=="echoed")
        {
            todo.echo = todo.echo - 2;
            todo.order = todo.order +2;
            $scope.$storage[todo.$id] = "d_echoed";
        } else {
            todo.echo = todo.echo - 1;
            todo.order = todo.order +1;
            $scope.$storage[todo.$id] = "d_echoed";
        }
        $scope.todos.$save(todo);
    };

    $scope.doneEditing = function (todo) {
        $scope.editedTodo = null;
        var wholeMsg = $scope.input.editMsg.trim();
        if (wholeMsg) {
            
            $scope.todos.$save(todo);
        } else {
            $scope.removeTodo(todo);
        }
    };

    $scope.revertEditing = function (todo) {
        todo.wholeMsg = $scope.originalTodo.wholeMsg;
        $scope.doneEditing(todo);
    };

    $scope.removeTodo = function (todo) {
        $scope.todos.$remove(todo);
    };

    $scope.clearCompletedTodos = function () {
        $scope.todos.forEach(function (todo) {
            if (todo.completed) {
                $scope.removeTodo(todo);
            }
        });
    };

    $scope.toggleCompleted = function (todo) {
        todo.completed = !todo.completed;
        $scope.todos.$save(todo);
    };

    $scope.markAll = function (allCompleted) {
        $scope.todos.forEach(function (todo) {
            todo.completed = allCompleted;
            $scope.todos.$save(todo);
        });
    };

    $scope.increaseMax = function () {
        if ($scope.maxQuestion < $scope.totalCount) {
            $scope.maxQuestion+=scrollCountDelta;
        }
    };

    $scope.toTop =function toTop() {
        $window.scrollTo(0,0);
    };

    // Not sure what is this code. Todel
    if ($location.path() === '') {
        $location.path('/');
    }
    $scope.location = $location;

    // autoscroll
    angular.element($window).bind("scroll", function() {
        if ($window.innerHeight + $window.scrollY >= $window.document.body.offsetHeight) {
            console.log('Hit the bottom2. innerHeight' +
            $window.innerHeight + "scrollY" +
            $window.scrollY + "offsetHeight" + $window.document.body.offsetHeight);

            // update the max value
            $scope.increaseMax();

            // force to update the view (html)
            $scope.$apply();
        }
    });

    // set post time interval to prevent user repeating post questions
    $scope.setPostTimeInterval = function () {
        // disable the button after post button clicked
        $scope.disableTimeInterval = true;
        // console.log("Post Time interval start");

        // time count down
        $scope.postTimeCounter = 5;

        // refresh and display the time count
        $scope.onTimeout = function(){
            // console.log($scope.postTimeCounter);
            $scope.postTimeCounter--;
            mytimeout = $timeout($scope.onTimeout,1000);
        }
        var mytimeout = $timeout($scope.onTimeout, 1000);

        // terminal the timer after 5 seconds
        $timeout(function() {
            $timeout.cancel(mytimeout);
            // console.log("Post Time interval end");
            $scope.disableTimeInterval = false;
            $scope.postTimeCounter = 0;
        }, 5000);
    }
}]);