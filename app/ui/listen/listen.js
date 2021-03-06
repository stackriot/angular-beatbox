import app from "../../app";
import "./listen.scss";

app.directive("bbListen", ($) => {
	return {
		template: require("./listen.html"),
		scope: {},
		replace: true,
		controller: "bbListenController"
	};
});

app.controller("bbListenController", ($scope, bbState, bbUtils, $filter, $, $element, ng, bbPlayer) => {
	$scope.state = new bbState();
	$scope.utils = bbUtils;

	$scope.$watch("filter", () => {
		$scope.tuneList = $filter("bbPatternListFilter")($scope.state, $scope.filter);
	}, true);
	$scope.$watch("state", () => {
		$scope.tuneList = $filter("bbPatternListFilter")($scope.state, $scope.filter);
	}, true);

	$scope.selectTune = (tuneName) => {
		$scope.tuneName = tuneName;
		$scope.tune = $scope.state.tunes[tuneName];
		$scope.$emit("bbOverview-closePatternList");

		bbPlayer.stopAll();

		setTimeout(() => {
			$scope.scrollToTune();
		}, 0);
	};

	$scope.scrollToTune = (tuneName) => {
		let list = $(".bb-listen-tunes > .nav", $element)[0];

		let el = $(".nav-item.active", list)[0];
		if(!el)
			return;

		if(list.scrollTop > el.offsetTop)
			$(list).animate({ scrollTop: el.offsetTop });
		else if(list.scrollTop < el.offsetTop + el.offsetHeight - list.offsetHeight)
			$(list).animate({ scrollTop: el.offsetTop + el.offsetHeight - list.offsetHeight});
	};

	$scope.$watch("tuneName", (tuneName) => {
		if(tuneName)
			$scope.$emit("bbPatternList-tuneOpened", tuneName);
	});

	$scope.$on("bbListen", function(e, tuneName) {
		if(!$scope.state.tunes[tuneName] || tuneName == $scope.tuneName)
			return;

		if($filter("bbPatternListFilter")($scope.state, $scope.filter).indexOf(tuneName) == -1)
			$scope.filter = { text: "", cat: $scope.state.tunes[tuneName].categories[0] || "all" };

		$scope.selectTune(tuneName);
	});
});