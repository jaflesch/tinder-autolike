var mutationObserverInstance = (function() {
    // Assume changed on first run
    var changed = true;
    var config = {
        attributes: true,
        childList: true,
        subtree: true
    };
    var noopFn = function noopFn() {}
    var customHook = null; 
    var instance = null; 
    var observerCb = function() {
        // set changed to true
        changed = true;
        if (customHook) {
            customHook();
        }
    };
    function isSupported() {
        return window &&
            'MutationObserver' in window;
    }
    var publicMethods = {
        observe: noopFn,
        getChangeState: noopFn,
        resetChangeState: noopFn,
        registerCallback: noopFn,
        overrideConfig: noopFn,
        isSupported: isSupported
    };

    publicMethods.init = function() {

        if (!isSupported())  {
            return publicMethods;
        }

        if (!instance) {
            instance = new MutationObserver(observerCb);
        }

        publicMethods.getChangeState = function() {
            return changed;
        }

        publicMethods.resetChangeState = function() {
            changed = false;
        }

        // Only set methods when observe when init is called
        publicMethods.observe = function(className) {
            const targetNode = document.getElementsByClassName(className)[0];
            instance.observe(targetNode, config);
        }

        publicMethods.registerCallback = function(cb) {
            customHook = cb;
            // Create new instance
            instance = new MutationObserver(observerCb);
        }

        publicMethods.overrideConfig = function(customConfig) {
            config = Object.assign(config, customConfig);
        }

        return publicMethods;
    }

    publicMethods.destroy = function() {
        instance.disconnect();
    }

    return publicMethods;
})()

function geLikeWrapper() {
    var config = {
        tinder: {
            urlRegex: /tinder/,
            buttonClass: 'recsGamepad__button--like'
        },
        okCupid: {
            urlRegex: /okcupid/,
            buttonClass: 'cardactions-action--like',
            // The container containing matches
            parentContainer: 'qmcard'
        },
        bumble: {
            urlRegex: /bumble/,
            buttonClass: 'encounters-action encounters-action--like',
            continueButtonSelector: '.encounters-match__cta-action > .button',
            // The container containing matches
            parentContainer: 'encounters-album'
        }
    };

    var noopFn = function noopFn() {}
    var type = '';
    var href = window.location.href || '';
    var closeMatchScreen = noopFn;
    var targetConfig = {};
    var publicMethods = {
        clickLikeButton: noopFn,
        getDelay: noopFn,
        resolveFailedClick: noopFn
    };

    function matchUrlType(href, type) {
        var _targetConfig = config[type] || {};
        return href.match(_targetConfig.urlRegex);
    }
    function isTinder(href) { return matchUrlType(href, 'tinder') }
    function isOkCupid(href) { return matchUrlType(href, 'okcupid') }
    function isBumble(href) { return matchUrlType(href, 'bumble') }

    if(isTinder(href)) {
        type = 'tinder';
        targetConfig = config[type] || {};
        publicMethods.getDelay = function getDelay() {
            // If reached max likes per day then show modal and get it's content...
            // Check if there is any subscription button...
            if (document.getElementsByClassName('productButton__subscriptionButton').length > 0) {
                // We get the counter thing
                var hms = document.getElementsByClassName('Fz($ml)')[0].textContent;
                // Split it at the colons
                var a = hms.split(':');
                // Minutes are worth 60 seconds. Hours are worth 60 minutes. 1 second = 1kmilliseconds.
                // Genius... rocket science...
                var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
                return seconds * 1000;
            }
        }
    }

    if(isOkCupid(href)) {
        type = 'okCupid';
        targetConfig = config[type] || {};
    }

    if(isBumble(href)) {
        type = 'bumble';
        targetConfig = config[type] || {};
        function matchesContinue(innerText) {
            return innerText.match(/continue/i);
        }
        function getInnerText(element) {
            if (element) {
                return element.innerText.trim();
            }
            return '';
        }
        function filterByTargetButton(element) {
            return matchesContinue(getInnerText(element));
        }
        // If matched, find a way to proceed
        closeMatchScreen = function() {
            var nodeArray = [].slice.call(document.querySelectorAll(targetConfig.continueButtonSelector));
            var targetNodes = nodeArray.filter(filterByTargetButton);
            var targetNode = targetNodes[0] || {};
            console.log(targetNode);
            targetNode.click();
        }
    }

    publicMethods.targetConfig = targetConfig;

    /**
     *
     *  Fail clicks are detected via dom changed using mutationObserverInstance <MutationObserver> 
     *
     * */
    publicMethods.resolveFailedClick = function() {
        /** possible resolution methods */

        // 1. close match screen
        closeMatchScreen();

        // other resolution methods...
    }

    publicMethods.handleButtonClick = function () {
        var targetConfig = config[type] || {};
        var targetButtonClassName = targetConfig.buttonClass;
        var buttonElement = document.getElementsByClassName(targetButtonClassName)[0] || {};
        // Press the like button
        buttonElement.click();
    }

    return publicMethods;
}

// There is a lot more fun that can be achieved
// Need to add socket puppetry (VPNs solutions? several accounts?) - :D
// TODO: Need to accept automatically permissions except for
// TODO: Need to add ANN for fake pics
// TODO: Need to add RNN for fake messages 

function getRandomPeriod() {
	return Math.round(Math.random() * (2000 - 500)) + 500;
}

(function loopSasori() {
	// A random period between 500ms and 2secs
	var randomPeriod = getRandomPeriod();

	setTimeout(function() {
		randomPeriod = undefined;
        var likeWrapper = geLikeWrapper();
        var delay = likeWrapper.getDelay();
        var targetConfig = likeWrapper.targetConfig;
        var domObserverWrapper = mutationObserverInstance.init();
        domObserverWrapper.observe(targetConfig.parentContainer);
        // detect changes based on dom node changes
        var hasChanged = domObserverWrapper.getChangeState();

        if (!hasChanged && domObserverWrapper.isSupported()) {
            console.log('Something is wrong, button click was unsuccessful');
            // Try to resolve 
            likeWrapper.resolveFailedClick();
        }

        if (isFinite(delay)) {
            randomPeriod = delay;
        }

        likeWrapper.handleButtonClick();

        setTimeout(loopSasori, randomPeriod);

        // Reset the change state in dom observer wrapper for the next cycle (if it has changed at all)
        domObserverWrapper.resetChangeState();
	}, randomPeriod);
}());
