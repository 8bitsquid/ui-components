/**
 * Modified from ui-utils module - https://github.com/angular-ui/ui-utils
 *
 * This scroll fix preserves the fixed element's with
 */
/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
angular.module('ualib.ui').directive('uiScrollfix', [
    '$window',
    function ($window) {
        'use strict';
        function getWindowScrollTop() {
            if (angular.isDefined($window.pageYOffset)) {
                return $window.pageYOffset;
            } else {
                var iebody = document.compatMode && document.compatMode !== 'BackCompat' ? document.documentElement : document.body;
                return iebody.scrollTop;
            }
        }

        // Allows calculation of child elem offsets
        // borrowed from https://jsperf.com/offset-vs-getboundingclientrect/8
        function loopedOffset(elem) {
            var offsetLeft = elem.offsetLeft,
                offsetTop = elem.offsetTop;
            while (elem = elem.offsetParent) {
                offsetLeft += elem.offsetLeft;
                offsetTop += elem.offsetTop;
            }
            return {
                left: offsetLeft,
                top: offsetTop
            };
        };
        return {
            restrict: 'AC',
            require: '^?uiScrollfixTarget',
            link: function (scope, elm, attrs, uiScrollfixTarget) {
                var absolute = true, 
                    shift = -30,
                    fixLimit,
                    $target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window);
                
                if (!attrs.uiScrollfix) {
                    absolute = false;
                } else if (typeof attrs.uiScrollfix === 'string') {
                    // charAt is generally faster than indexOf: http://jsperf.com/indexof-vs-charat
                    if (attrs.uiScrollfix.charAt(0) === '-') {
                        absolute = false;
                        shift = -parseFloat(attrs.uiScrollfix.substr(1));
                    } else if (attrs.uiScrollfix.charAt(0) === '+') {
                        absolute = false;
                        shift = parseFloat(attrs.uiScrollfix.substr(1));
                    }
                }
                fixLimit = absolute ? attrs.uiScrollfix : loopedOffset(elm[0]).top + shift;

                function onScroll() {
                    var limit = absolute ? attrs.uiScrollfix : loopedOffset(elm[0]).top + shift;
                    // if pageYOffset is defined use it, otherwise use other crap for IE
                    var offset = uiScrollfixTarget ? $target[0].scrollTop : getWindowScrollTop();

                    if (!elm.hasClass('scrollfix') && offset > limit) {
                        var width = elm[0].offsetWidth;
                        elm.css('width', width + 'px');
                        elm.addClass('scrollfix');
                        fixLimit = limit;
                    } else if (elm.hasClass('scrollfix') && offset < fixLimit) {
                        elm.removeClass('scrollfix');
                        elm.css('width', 'auto');
                    }
                }
                $target.on('scroll', onScroll);
                // Unbind scroll event handler when directive is removed
                scope.$on('$destroy', function () {
                    $target.off('scroll', onScroll);
                });
            }
        };
    }
]).directive('uiScrollfixTarget', [function () {
    'use strict';
    return {
        controller: [
            '$element',
            function ($element) {
                this.$element = $element;
            }
        ]
    };
}]);