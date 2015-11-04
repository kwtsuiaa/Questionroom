var myApp = angular.module('myApp.services', []).
value('version', '0.1');

myApp.
//view1
controller('MyCtrl1', ['$scope', function($scope) {
  $scope.test1 = 'EFG';
}])

//view2
.controller('MyCtrl2', ['$scope', function($scope) {
  $scope.test2 = function() {
    return 'Hello!';
  };
}]);

// Dummy controller for testing
myApp.
controller('MyCtrl1', ['$scope', '$location', function($scope, $location) {
  $scope.test1 = 'EFG';

  // Get the first sentence and rest
  $scope.getFirstAndRestSentence = function($string) {
    var head = $string;
    var desc = "";

    var separators = ['.', '?', '\n'];

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

}]);
