
mod.controller('stylerController', ['$scope',
function ($scope) {

    /**
     * variables
     */


    /**
     * watches
     */
    $scope.$watch('widget', function (val) {
        $scope.model = $$get($scope, 'widget.style');
    });

    $scope.ShowInnerLabelsTick = function () {
        $scope.model.isInnerLabels = !$scope.model.isInnerLabels;
        _.defer(function () {
            $scope.$root.widget.redraw();
        });
    };

    /**
     * public methods
    */
}
]);