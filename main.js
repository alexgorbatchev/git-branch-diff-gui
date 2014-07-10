// require('nw.gui').Window.get().showDevTools();

var gitBranchDiff = require('git-branch-diff');
var R = require('ramda');
var app = angular.module('git-diff', []);

app.service('branches', function($rootScope, $q) {
  function Branches() {
    var self = this;

    self.load = function(targetDirectory) {
      gitBranchDiff(targetDirectory, "origin/preflight_shared")
        .then(self.setBranches)
        .then(function() { $rootScope.$digest(); })
        ;
    };

    self.setBranches = function(branches) {
      self.allBranches = branches;
      self.setBranch(branches[0].branch);
    };

    self.setBranch = function(branch, $index) {
      self.activeBranchIndex = $index || 0;
      self.activeBranch = self.allBranches[R.findIndex(R.propEq('branch', branch))(self.allBranches)];
      self.setFile(self.activeBranch.files[0].file);
    };

    self.setFile = function(file, $index) {
      self.activeFileIndex = $index || 0;
      self.activeFile = self.activeBranch.files[R.findIndex(R.propEq('file', file))(self.activeBranch.files)];
    };
  }

  return new Branches();
});

app.run(function(branches) {
});

function BranchesController($scope, branches) {
  $scope.branches = branches;
  $scope.targetDirectory = localStorage.targetDirectory;

  $scope.pickTargetDirectory = function() {
    var el = document.querySelector('#directoryPicker');

    el.addEventListener('change', function() {
      $scope.targetDirectory = localStorage.targetDirectory = el.value;
      $scope.$digest();
      el.removeEventListener('change');
    });

    el.click();
  };

  function load() {
    targetDirectory = $scope.targetDirectory;

    if (targetDirectory) {
      localStorage.targetDirectory = targetDirectory;
      branches.load(targetDirectory);
    }
  }

  $scope.$watch('targetDirectory', load);
}
