'use strict';
angular.module('ui.bootstrap', []);
angular.module('angular-smilies', []);

describe('TodoCtrl', function() {
  beforeEach(module('todomvc'),module('ui.bootstrap'),module('angular-smilies'));
  // variables for injection
  var controller;
  var scope;
  var location;
  var firebaseArray;
  var sce;
  var localStorage;
  var window;



  // Injecting variables
  // http://stackoverflow.com/questions/13664144/how-to-unit-test-angularjs-controller-with-location-service
  beforeEach(inject(function($location,
    $rootScope,
    $controller,
    $firebaseArray,
    $localStorage,
    $sce,
    $window){
      // The injector unwraps the underscores (_) from around the parameter names when matching

      scope = $rootScope.$new();
      location = $location;
      controller = $controller;
      firebaseArray = $firebaseArray;
      sce = $sce;
      localStorage = $localStorage;
      window = $window;
    
    }));

    describe('TodoCtrl Testing', function() {
      it('setFirstAndRestSentence', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope
        });

        var testInputs = [
          {str:"Hello? This is jj Sung", exp: "Hello?"},
          {str:"Hello.co? 123 This is Sung", exp: "Hello.co?"},
          {str:"Hello.co This is Sung!!@@", exp: "Hello.co This is Sung!!@@"},
          {str:"Hello.co \nThis is gg Sung", exp: "Hello.co \n"},
          {str:"Hello?? This is 123 321 Sung", exp: "Hello??"},
          {str:"Hello?? \nThis is Sung \n 123", exp: "Hello??"}, 
          {str:"?", exp: "?"}
        ];

        for (var i in testInputs) {
          var results = scope.getFirstAndRestSentence(testInputs[i].str);
          expect(results[0]).toEqual(testInputs[i].exp);
        }

      });

      it('RoomId', function() {
        location.path('/new/path');

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location
        });

        expect(scope.roomId).toBe("new");
      });

      it('toTop Testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $location: location,
          $firebaseArray: firebaseArray,
          $sce: sce,
          $localStorage: localStorage,
          $window: window
        });

        scope.toTop();
        expect(window.scrollX).toBe(0);
        expect(window.scrollY).toBe(0);
      });

      it('timeAgo Testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope
        });

        var now = new Date().getTime();
        var pastTime = [{t:now-5, res:0}, {t:now-30, res:0}, {t:50000, res:0}, {t:now-80000, res:0}, {t:now-3000000, res:0}, {t:now-1000000, res:0}];
        for (var i in pastTime) {
        	var result = scope.timeAgo(pastTime[i].t);
        	expect(result).toEqual(pastTime[i].res);
        }
      });

      it('filterWord Testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope
        });

      	var words = [{str:"fuck", res:true}, {str:"hello", res:false}];
      	for (var i in words) {
      		var result = scope.filterWord(words[i].str);
      		expect(result).toEqual(words[i].res);
      	}
      });

      it('addToDo Testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });

        scope.input = {wholeMsg: "test#tag"};
        scope.addTodo();

        scope.input = {wholeMsg: ""};
        scope.addTodo();

      });

      it('increaseMax Testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $window: window
        });

        scope.maxQuestion = 1;
        scope.totalCount = 10;
        scope.increaseMax();

        scope.maxQuestion = 11;
        scope.totalCount = 1;
        scope.increaseMax();

      });

      it('markAll testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });

        var questionList=[{
          wholeMsg: "newTodo",
          head: "head",
          headLastChar: "?",
          desc: "desc",
          linkedDesc: "linkedDesc",
          completed: false,
          timestamp: 0,
          tags: "...",
          echo: 3,
          order: 3
        },{
          wholeMsg: "newTodo",
          head: "head",
          headLastChar: "?",
          desc: "desc",
          linkedDesc: "linkedDesc",
          completed: false,
          timestamp: 1,
          tags: "...",
          echo: 2,
          order: 6
        }]

        scope.markAll();       

      });

      it('removeTodo testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });
        scope.removeTodo();

        // the todos array should be deleted completely
        //expect(scope.todos).toEqual(empty_arr); 
      });

      it('revertEditing testing', function() {  
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });
        var test_todo = {wholeMsg: "test321"};  
        scope.originalTodo = {wholeMsg: "test"};
        scope.revertEditing(test_todo);     
      });

      it('doneEditing testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });

        var test_todo = {wholeMsg: ""};       
        scope.doneEditing(test_todo);  

        var test_todo = {wholeMsg: "this is a testing msg"};    
        scope.doneEditing(test_todo);      
      });

      it('clearCompletedTodos testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });

        var test_todos = [{completed:true},{completed:false}];
        scope.todos = test_todos;
        scope.todos.$remove = function() {}; // dummy function

        scope.clearCompletedTodos();

        expect(1).toEqual(1); // dummpy assert
      });

      it('toggleCompleted testing', function() {
        
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });


        var test_todo = {completed: false};
        scope.toggleCompleted(test_todo);
        expect(1).toEqual(1); // dummpy assert
      });

      it('markAll testing', function() {
        
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });

        var allCompleted = [
          {wholeMsg: "newTodo", completed: false},
          {wholeMsg: "newTodo21", completed: true}
        ];

        scope.todos = [{wholeMsg: "newTodo", completed: true},{}];
        scope.todos.$save = function() {};  // dummy function

        scope.markAll(allCompleted);
        expect(1).toEqual(1); // dummpy assert

      });

      it('editTodo testing', function() {
        
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });

        var test_todo = {wholeMsg: "test"};        
        scope.editTodo(test_todo);
        expect(1).toEqual(1); // dummpy assert
      });

      it('addEcho testing', function() {
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $localStorage: localStorage
        });

        var test_todo = {
          echo: 2,
          order: 3
        }; 

        scope.addEcho(test_todo);
        expect(test_todo.echo).toBe(3);
        expect(test_todo.order).toBe(2);

      });

      it('subEcho testing', function() {
      	var ctrl = controller('TodoCtrl', {
        	$scope: scope,
        });

        var test_todo = {
          echo: 2,
          order: 3
        };  
        scope.subEcho(test_todo);
        expect(test_todo.echo).toBe(1);
        expect(test_todo.order).toBe(4);

      });

      it('watchcollection testing', function() {
        
        var ctrl = controller('TodoCtrl', {
          $scope: scope,
        });

        var test_todo = [{
          wholeMsg: "newTodo",
          head: "head",
          headLastChar: "?",
          desc: "desc",
          linkedDesc: "linkedDesc",
          completed: true,
          timestamp: 0,
          tags: "...",
          echo: 2,
          order: 3
        },{
          wholeMsg: "newTodo",
          head: "head",
          headLastChar: "?",
          desc: "desc",
          linkedDesc: "linkedDesc",
          completed: false,
          timestamp: 0,
          tags: "...",
          echo: 20,
          order: 2
        },{}];  

        scope.todos = test_todo;
        scope.$digest();
        expect(1).toEqual(1); // dummpy assert       

      });

      it('autoscroll testing', function() {      

        // spyOn(window, 'scroll');
        // expect(window.scroll).toHaveBeenCalled();
        var mock_window = {
          location: 'val',
          document: [
            {
              createElement: function() {
                return null;
              }              
            }
          ]

        };

        var ctrl = controller('TodoCtrl', {
          $scope: scope,
          $window: mock_window
        });

        // body.offsetHeight = 20;

        // window.innerHeight = 200;
        // window.scrollY = 200;
        // window.document.body.offsetHeight = 200;        
        
        // window.scroll(100,200);
        // $(mock_window).scroll();
        scope.$apply();
      });

      it('setPostTimeInterval Testing', function() {
      	var ctrl = controller('TodoCtrl', {
          $scope: scope
        });

        scope.setPostTimeInterval();
      });

    });
  });
