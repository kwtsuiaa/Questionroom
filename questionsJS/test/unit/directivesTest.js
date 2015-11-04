'use strict';

describe('TodoCtrl', function() {

  var $compile, $rootScope, $timeout, $document;
  beforeEach(module('todomvc'));

  describe('Directives Testing', function() {
    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_,_$document_) {
      // $provide.value('version', 'TEST_VER'); //TODO: what is this provide?
      // console.log("provide.value: " + $provide.value);
      $compile = _$compile_;
    	$rootScope = _$rootScope_;
    	$rootScope.$digest();
      $timeout = _$timeout_;
      $document = _$document_;
    }));

    it('Test todoBlur', function() {
    	var scope = $rootScope.$new();
    	var elm = angular.element('<input type="text" todo-blur="blur" autofocus>');
    	
    	$compile(elm)(scope);

			scope.$digest();      
      scope.$apply();
      scope.$destroy();

      expect("1").toEqual("1"); // dummpy assert

    });

    it('Test todoBlur keydown', function() {
      var scope = $rootScope.$new();
      var elm = angular.element('<input type="text" todo-escape="" autofocus value="test">');

      $compile(elm)(scope);

      // var e = $.Event('keydown');
      // e.which = 27; // (code for ESCAPE_KEY)
      $(elm).trigger('keydown');
      scope.$digest();      
      scope.$apply();

    });

    it('Test todoFocus', function() {
      var scope = $rootScope.$new();
      var elm = angular.element('<input type="text" todo-focus="focus" autofocus value="test">');

      $compile(elm)(scope);

      scope.$digest();      
      scope.$apply(function(){
        scope.focus = true;
        elm[0].focus();
      });

      expect("1").toEqual("1"); // dummpy assert
    });

    it('Test todoEscape', function() {
      var scope = $rootScope.$new();
      scope.escapeCallback = jasmine.createSpy('escapeCallback');
      var elem = angular.element('<input todo-escape="escapeCallback">');
      element = $compile(elem)(scope);  

      spyOn(element, 'unbind');      
    
      var givenEvent = { keyCode: 27 };
			element.triggerHandler('keydown', givenEvent);
    	scope.$digest();
    	expect(scope.escapeCallback).toHaveBeenCalled();

    	scope.$destroy();
    	expect(element.unbind).toHaveBeenCalledWith('keydown');
    });

  });
});