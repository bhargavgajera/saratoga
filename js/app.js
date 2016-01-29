//var SitePath = 'http://developmentbox.co/saratoga/';
//var SitePath = 'http://dev.discoversaratoga.org/';
//var SitePath = 'http://discoversaratoga.org/live/';
var SitePath = 'http://discoversaratoga.org/';

var root = null;



 /*==================  angular-ios9-uiwebview.patch.js v1.1.1 ==================*/


angular.module('ngIOS9UIWebViewPatch', ['ng']).config(['$provide', function($provide) {
  'use strict';

  $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {

    if (isIOS9UIWebView($window.navigator.userAgent)) {
      return applyIOS9Shim($delegate);
    }

    return $delegate;

    function isIOS9UIWebView(userAgent) {
      return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
    }

    function applyIOS9Shim(browser) {
      var pendingLocationUrl = null;
      var originalUrlFn= browser.url;

      browser.url = function() {
        if (arguments.length) {
          pendingLocationUrl = arguments[0];
          return originalUrlFn.apply(browser, arguments);
        }
        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
      };

      window.addEventListener('popstate', clearPendingLocationUrl, false);
      window.addEventListener('hashchange', clearPendingLocationUrl, false);

      function clearPendingLocationUrl() {
        pendingLocationUrl = null;
      }

      return browser;
    }
  }]);
}]);





// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


angular.module('saratoga', ['ionic', 'saratoga.controllers', 'ngCordova', 'chart.js','ngIOS9UIWebViewPatch'])

.run(function ($ionicPlatform, $rootScope, $cordovaVibration, $cordovaNativeAudio) {
    $ionicPlatform.ready(function () {
        
        $rootScope.errorMSG = "Sorry, something went wrong";
        
        native = $cordovaNativeAudio;
        $cordovaNativeAudio.preloadComplex('check', 'audio/beep.mp3', 1, 1)
            .then(function (msg) {
              console.log(msg);
            }, function (error) {
              console.error(error);
            });
            
        console.log("native audio")
        console.log($cordovaNativeAudio);

        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        if (window.cordova) {
            $rootScope.$on('$ionicView.enter', function () {
                console.log($rootScope.settings.mobile[1]);
                if ($rootScope.settings.mobile[1].status) {
                    $cordovaVibration.vibrate(500);
                }
                if ($rootScope.settings.mobile[0].status) {
                    $cordovaNativeAudio.play('check');
                }
            });

        }
    })
})

.run(function ($cordovaPush, $rootScope, $state, $ionicPopup, $cordovaNetwork, $cordovaPush, $cordovaDevice,$cordovaVibration) {

    console.log("$cordovaDevice")
    console.log($cordovaDevice)
    //console.log($cordovaDevice.getPlatform());
    

    root = $rootScope;
    console.log("root")
    console.log(root)
    
   
    
    var androidConfig = {
        "senderID": "333853412042",
    };
    
    var iosConfig = {
            "badge": false,
            "sound": false,
            "alert": true,
    };

    if (window.localStorage.getItem("userData") != "undefined") {
        $rootScope.userData = JSON.parse(window.localStorage.getItem("userData"));
    }

    document.addEventListener("deviceready", function () {
        
         $rootScope.platform = "Android";
         $rootScope.platform = $cordovaDevice.getPlatform()
        
        var myPopup;
        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            console.log("online");
            console.log(event);
            console.log(networkState);

            if (typeof myPopup != "undefined") {
                myPopup.close();
            }
        });

        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            console.log("offline");
            console.log(event);
            console.log(networkState);

            if (typeof myPopup != "undefined") {
                myPopup.close();
            }
            myPopup = $ionicPopup.show({
                template: 'Sorry, no Internet Connectivity detected. Please reconnect and try again.',
                title: '<h4 class="positive">No Internet Connection</h4>',
                cssClass: 'internetError',
                buttons: [
                    {
                        text: 'Retry',
                        type: 'button-royal',
                        onTap: function (e) {
                            if ($cordovaNetwork.isOffline()) {
                                e.preventDefault();
                            }
                        }
               },
             ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        });


        if (window.localStorage.getItem("userData") != null) {
            console.log($rootScope.userData);
            $state.go('app.notifications');
        }



        if ($rootScope.platform == "Android") {
            androidPush()
        } else {
            iosPush()
        }

    }, false);



    function androidPush() {
        console.log("android")
        console.log(androidConfig);
        // if (window.localStorage.getItem("regId") == null) {
        $cordovaPush.register(androidConfig).then(function (result) {
            //Success
            console.log(result);
        }, function (err) {
            // Error
            alert("Error");
        });
        //   }


        $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
            switch (notification.event) {
                case 'registered':
                    if (notification.regid.length > 0) {
                        // alert('registration ID = ' + notification.regid);
                        console.log('registration ID = ' + notification.regid);
                        window.localStorage.setItem("regId", notification.regid);
                    }
                    break;

                case 'message':
                    // this is the actual push notification. its format depends on the data model from the push server
                    //alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                    console.log("test");
                    console.log(notification);
                    
                    if ($rootScope.settings.mobile[1].status) {
                        $cordovaVibration.vibrate(500);
                    }
                    if ($rootScope.settings.mobile[0].status) {
                        navigator.notification.beep(1)
                    }
                    
                    if (notification.payload.page != "" && typeof notification.payload.page !== "undefined" ) {
                        document.location.hash = notification.payload.page;
                    } else if (window.localStorage.getItem("userData") != null) {
                        document.location.hash = "#/app/notifications";
                    } else {
                        document.location.hash = "#/home";
                    }
                    
                    $rootScope.$broadcast('updateNotification');
                    
                    if (notification.payload.externallink != "") {
                        window.open(notification.payload.externallink, '_system');
                    }
                    
                    
                    
                    break;

                case 'error':
                    alert('GCM error = ' + notification.msg);
                    console.log(notification.msg);
                    break;

                default:
                    alert('An unknown GCM event has occurred');
                    break;
            }
        });
    }
    
    function iosPush()
    {
        console.log("Ios");
        console.log(iosConfig);
            $cordovaPush.register(iosConfig).then(function (deviceToken) {
                
                console.log("deviceToken: " + deviceToken)
                 window.localStorage.setItem("regId", deviceToken);
                
            }, function (err) {
                alert("Registration error: " + err)
            });


            $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                
                console.log("event")
               console.log(event);
               console.log("ios notification")
               console.log(notification);
                
                
               /* if (notification.alert) {
                   // navigator.notification.alert(notification.alert);
                    $ionicPopup.alert({
                        title: 'Notification',
                        template: notification.alert
                    });
                }*/
                
                if ($rootScope.settings.mobile[1].status) {
                        $cordovaVibration.vibrate(500);
                }
                
                if ($rootScope.settings.mobile[0].status) {
                    navigator.notification.beep(1)
                }
                
                if (notification.sound) {
                   // var snd = new Media(event.sound);
                   // snd.play();
                }

                if (notification.badge) {
                    $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                        // Success!
                    }, function (err) {
                        // An error occurred. Show a message to the user
                    });
                }
                
                
                if (notification.link != "") {
                        document.location.hash = notification.link;
                    } else if (window.localStorage.getItem("userData") != null) {
                        document.location.hash = "#/app/notifications";
                    } else {
                        document.location.hash = "#/home";
                    }
                    
                    $rootScope.$broadcast('updateNotification');    
                
                    if (notification.externallink != "") {
                        console.log("click on push notification in ios : "+ notification.externallink)
                        window.open(notification.externallink, '_system');
                    }
            });
    }
})





.config(function ($stateProvider, $urlRouterProvider) {
    var mainPage = "/app/notifications";
    if (window.localStorage.getItem("userData") == null) {
        mainPage = "/home";
    }

    $urlRouterProvider.otherwise(mainPage);
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'templates/walkthrough.html',  
            controller:'homeCtrl'
        })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'

    })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'registerCtrl'
    })

    .state('forgot', {
        url: '/forgot',
        templateUrl: 'templates/forgot.html',
        controller: 'forgotCtrl'
    })



    .state('app', {
        url: '/app',
        cache: false,
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'appCtrl'
    })


    .state('app.notifications', {
        url: '/notifications',
        views: {
            'menuContent': {
                templateUrl: 'templates/notification.html',
                controller: 'notifyCtrl'
            }
        }
    })


    .state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html',
                controller: 'searchCtrl'
            }
        }
    })


    .state('app.map', {
        url: '/map',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/map.html',
                controller: 'mapCtrl'
            }
        }
    })

    .state('app.mapiframe', {
        url: '/mapiframe',
        views: {
            'menuContent': {
                templateUrl: 'templates/mapiframe.html',
            }
        }
    })



    .state('app.weather', {
        url: '/weather',
        views: {
            'menuContent': {
                templateUrl: 'templates/weather.html',
                controller: 'weatherCtrl'
            }
        }
    })

    .state('app.stats', {
        url: '/stats',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/stats.html',
                controller: 'statsCtrl'
            }
        }
    })

    .state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings.html',
                controller: 'settingCtrl'
            }
        }
    })
    
    .state('app.profile', {
        url: '/profile',
        views: {
            'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: 'profileCtrl'
            }
        }
    })
    

    .state('app.event', {
        url: '/event/:Id',
        views: {
            'menuContent': {
                templateUrl: 'templates/event_detail.html',
                controller: 'eventdetailCtrl'
            }
        }
    })



    .state('app.categories', {
        url: '/categories',
        views: {
            'menuContent': {
                templateUrl: 'templates/categories.html',
                controller: 'categoryCtrl'
            }
        }
    })


    .state('app.members', {
        url: '/members/:catId',
        views: {
            'menuContent': {
                templateUrl: 'templates/member_listing.html',
                controller: 'memberCtrl'
            }
        }
    })

    .state('app.favorite', {
        url: '/favorite',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/favorite.html',
                controller: 'favoriteCtrl'
            }
        }
    })

    .state('app.member', {
        url: '/member/:Id',
        views: {
            'menuContent': {
                templateUrl: 'templates/member_detail.html',
                controller: 'memberdetailCtrl'
            }
        }
    })


    .state('app.calendar', {
        url: '/calendar',
        views: {
            'menuContent': {
                templateUrl: 'templates/calendar.html',
                controller: 'calenderCtrl'
            }
        }

    })

    .state('app.connected', {
        url: '/connections/:Connected',
        views: {
            'menuContent': {
                templateUrl: 'templates/connections.html',
                controller: 'connectionCtrl'
            }
        }

    })
    
    
   /* .state('app.connections', {
        url: '/connections',
        views: {
            'menuContent': {
                templateUrl: 'templates/connections.html',
                controller: 'connectionCtrl'
            }
        }
    })*/
    
})




.factory("Data", ['$http', '$location', function ($http, $q, $location) {
    var serviceBase = SitePath;

    var obj = {};

    obj.get = function (q, object) {
        console.log(object);
        return $http.get(serviceBase + q, {
            params: object
        }).then(function (results) {
            return results.data;
        });
    };


    obj.put = function (q, object) {
        return $http.put(serviceBase + q, object).then(function (results) {
            return results.data;
        });
    };
    obj.delete = function (q) {
        return $http.delete(serviceBase + q).then(function (results) {
            return results.data;
        });
    };
    return obj;
}])


.filter('hrefToJS', function ($sce, $sanitize) {
    return function (text) {
        var regex = /href="([\S]+)"/g;
        var newString = $sanitize(text).replace(regex, "onClick=\"window.open('$1', '_system', 'location=yes')\"");
        return $sce.trustAsHtml(newString);
    }
});


