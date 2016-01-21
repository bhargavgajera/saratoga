angular.module('saratoga.controllers', [])


.controller('homeCtrl', function ($scope, Data, $rootScope, $ionicLoading, $ionicSlideBoxDelegate) {
    scope = $scope;
    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
    });

    Data.get("api/saratogaapp/homepage_display").then(function (result) {
        $ionicLoading.hide();
        console.log(result);
        if (result.status == "ok") {
            $scope.slides = result.slides;
            $rootScope.slides = result.slides;
            $ionicSlideBoxDelegate.update();

        } else {
            $scope.popup = $ionicPopup.alert({
                title: 'Error',
                template: result.error
            });
        }

    }, function (error) {
        $ionicLoading.hide();
        $scope.popup.close();
        $scope.popup = $ionicPopup.alert({
            title: 'Login failed!',
            template: 'Something Went Wrong!'
        });
    });
})





.controller('appCtrl', function ($scope, $state, $ionicModal, Data, $timeout, $rootScope, $filter, $ionicLoading, $ionicHistory) {

    $rootScope.displayName = $rootScope.userData.displayname;
    $rootScope.Avatar = $rootScope.userData.avatar;
    $scope.role = $rootScope.userData.role == "saratoga_member";
    $scope.logout = function () {
        console.log("test");

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });

        Data.get("api/user/signout", {
            userid: $rootScope.userData.id,
            deviceid: window.localStorage.getItem("regId")
        }).then(function (result) {
            $ionicLoading.hide();
            console.log("logout")
            console.log(result);
            if (result.status == "ok") {
                window.localStorage.removeItem("userData");
                $ionicHistory.clearHistory();
                $ionicHistory.clearCache();
                $state.go('home', {}, {
                    reload: true
                });
                $rootScope.userData = $rootScope.events = $rootScope.categories = $rootScope.catId = $rootScope.members = $rootScope.connections = $rootScope.settings = undefined;
            } else {
                $scope.popup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: result.error
                });
            }

        }, function (error) {
            $ionicLoading.hide();
            $scope.popup.close();
            $scope.popup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Something Went Wrong!'
            });
        });
    }

})


.controller('loginCtrl', function ($scope, $cordovaOauth, Data, $ionicPopup, $state, $rootScope, $ionicLoading) {

    scope = $scope;

    $scope.data = {};
    $scope.login = function (isvalid) {
        console.log(isvalid);
        if (!isvalid) {
            return false;
        }

        console.log(window.localStorage.getItem("regId"));

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get("api/user/signin", {
            username: $scope.data.username,
            password: $scope.data.password,
            deviceid: window.localStorage.getItem("regId"),
            devicetype: $rootScope.platform
        }).then(function (result) {
            console.log(result);
            console.log("---------------")
            $ionicLoading.hide();
            if (result.status == "ok") {
                window.localStorage.setItem("userData", JSON.stringify(result));
                $rootScope.userData = result;
                $state.go('app.notifications', null, {
                    location: 'replace'
                });
            } else {
                $scope.popup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: result.error
                });
            }
        }, function (error) {
            $ionicLoading.hide();
            $scope.popup.close();
            $scope.popup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Something Went Wrong!'
            });
        });
    }

    $scope.facebookLogin = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        //701002373339861
        $cordovaOauth.facebook("913249695424669", ["email", "user_location", "public_profile"]).then(function (result) {
            console.log("fb");
            console.log(result);
            Data.get("api/user/fb_connect", {
                access_token: result.access_token,
                deviceid: window.localStorage.getItem("regId"),
                devicetype: $rootScope.platform
            }).then(function (result) {
                console.log(result);
                console.log(result);
                $ionicLoading.hide();
                if (result.status == "ok") {
                    window.localStorage.setItem("userData", JSON.stringify(result));
                    $rootScope.userData = result;
                    $state.go('app.notifications', null, {
                        location: 'replace'
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Login failed!',
                        template: result.error
                    });
                }

            }, function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Error',
                    template: error
                });
            });
        }, function (error) {
            $ionicLoading.hide();
            console.log("fb error");
            console.log(error);
        });
    }
})




.controller('forgotCtrl', function ($scope, $cordovaOauth, $ionicPopup, $state, Data, $rootScope) {

    scope = $scope;

    $scope.email;
    $scope.forgot = function (isvalid, email) {
        console.log(email);
        if (!isvalid) {
            return false;
        }
        Data.get("api/user/retrieve_password", {
            user_login: email,
        }).then(function (result) {
            console.log("result")
            console.log(result);
            console.log("---------------")

            if (result.status == "ok") {
                $scope.popup = $ionicPopup.alert({
                    title: 'Mail sent Successfuly',
                    template: result.msg
                });
            } else {

                $scope.popup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: result.error
                });
            }
        }, function (error) {
            $scope.popup.close();
            $scope.popup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Something Went Wrong!'
            });
        });
    }
})


.controller('registerCtrl', function ($scope, $ionicActionSheet, $cordovaCamera, Data, $ionicPopup, $state, $cordovaFileTransfer, $rootScope, $ionicLoading) {
    scope = $scope;
    root = $rootScope;
    $scope.uploaded = false;
    $scope.data = {};
    $scope.data.lname = "";
    $scope.data.country = "United States of America";
    $scope.imagePath = null;

    $scope.showDetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                {
                    text: '<i class="icon ion-camera royal"></i>From Camera'
                },
                {
                    text: '<i class="icon ion-images royal"></i>From Gallery'
                }
             ],
            destructiveText: '',
            titleText: 'Upload Image',
            cancelText: 'Cancel',
            buttonClicked: function (index) {
                hideSheet();
                var options = {
                    quality: 100,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 500,
                    targetHeight: 500,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    cameraDirection: 1
                };

                if (index == 0) {
                    options.sourceType = Camera.PictureSourceType.CAMERA
                }
                $cordovaCamera.getPicture(options).then(function (imageData) {

                    $scope.uploaded = true;
                    console.log(imageData);
                    var image = document.getElementById('myImage');
                    image.src = imageData;
                    $scope.imagePath = imageData;
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: error
                    });
                });
            }
        });
    }

    $scope.registerForm = function () {


        console.log($scope.userForm);
        if ($scope.imagePath == null) {
            $ionicPopup.alert({
                title: 'No Profile Photo',
                template: "Please upload your profile photo"
            });
            return false;
        }

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });

        Data.get("api/get_nonce", {
            controller: 'user',
            method: 'register',
        }).then(function (result) {
            console.log(result);
            if (result.status == "ok") {
                Data.get("api/user/register", {
                    first_name: $scope.data.fname,
                    last_name: $scope.data.lname,
                    email: $scope.data.email,
                    username: $scope.data.uname,
                    user_pass: $scope.data.password,
                    display_name: $scope.data.fname + " " + $scope.data.lname || "",
                    country: $scope.data.country,
                    nonce: result.nonce,
                    deviceid: window.localStorage.getItem("regId"),
                    devicetype: $rootScope.platform

                }).then(function (result) {
                        console.log(result);
                        var UserId = result.user_id;
                        if (result.status == "ok") {
                            if ($scope.imagePath == null) {
                                $scope.getuserInfo(UserId);
                            } else {
                                var url = SitePath + "fileupload/upload.php";
                                var targetPath = $scope.imagePath;
                                var filename = targetPath.split("/").pop();
                                var options = {
                                    fileKey: "file",
                                    fileName: result.user_id,
                                    chunkedMode: false,
                                    mimeType: "image/jpg",
                                };
                                $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) {

                                    console.log("SUCCESS: " + JSON.stringify(result.response));
                                    console.log("this is success");
                                    console.log(result);

                                    $scope.getuserInfo(UserId);
                                }, function (err) {
                                    $ionicLoading.hide()
                                    console.log("ERROR: " + JSON.stringify(err));
                                    console.log("this is error");
                                    console.log(err);
                                    $scope.getuserInfo(UserId);

                                }, function (progress) {
                                    // console.log("progress: ")
                                    // console.log(progress);
                                });
                            }

                        } else {
                            $ionicLoading.hide()
                            $ionicPopup.alert({
                                title: 'Registration failed!',
                                template: result.error
                            });
                        }
                    },
                    function (error) {
                        $ionicLoading.hide()
                        $ionicPopup.alert({
                            title: 'Error',
                            template: error
                        });
                    });
            } else {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Registration failed!',
                    template: result.error
                });
            }
        }, function (error) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    };




    $scope.getuserInfo = function (userId) {

        Data.get("api/user/get_userinfo", {
            user_id: userId,
        }).then(function (result) {
                $ionicLoading.hide();
                if (result.status == "ok") {
                    window.localStorage.setItem("userData", JSON.stringify(result));
                    $rootScope.userData = result;
                    $state.go('app.notifications', null, {
                        location: 'replace'
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Registration failed!',
                        template: result.error
                    });
                }
            },
            function (error) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: error
                });
            });
    }






})




.controller('profileCtrl', function ($scope, $ionicActionSheet, $cordovaCamera, Data, $ionicPopup, $state, $cordovaFileTransfer, $rootScope, $ionicLoading, $ionicViewService) {
    scope = $scope;
    root = $rootScope;
    var userData = $rootScope.userData;
    $scope.uploaded = false;
    $scope.data = {};
    $scope.data.lname = "";
    $scope.imagePath = null;
    $scope.oldimage = $rootScope.userData.avatar;

    $scope.data = {
        fname: userData.firstname,
        lname: userData.lastname,
        email: userData.email,
        uname: userData.username,
        password: "",
        cpassword: "",
        country: userData.country
    };


    $scope.showDetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                {
                    text: '<i class="icon ion-camera royal"></i>From Camera'
                },
                {
                    text: '<i class="icon ion-images royal"></i>From Gallery'
                }
             ],
            destructiveText: '',
            titleText: 'Upload Image',
            cancelText: 'Cancel',
            buttonClicked: function (index) {
                hideSheet();
                var options = {
                    quality: 100,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 500,
                    targetHeight: 500,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    cameraDirection: 1
                };

                if (index == 0) {
                    options.sourceType = Camera.PictureSourceType.CAMERA
                }
                $cordovaCamera.getPicture(options).then(function (imageData) {

                    $scope.uploaded = true;
                    console.log(imageData);
                    var image = document.getElementById('myImage');
                    image.src = imageData;
                    $scope.imagePath = imageData;
                }, function (error) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: error
                    });
                });
            }
        });
    }

    $scope.updateForm = function () {
        console.log($scope.userForm);
        if ($scope.imagePath == null && $scope.oldimage == null) {
            $ionicPopup.alert({
                title: 'No Profile Photo',
                template: "Please upload your profile photo"
            });
            return false;
        }

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });


        Data.get("api/user/update_profile", {
            userid: $rootScope.userData.id,
            userfname: $scope.data.fname,
            userlname: $scope.data.lname,
            email: $scope.data.email,
            pasword: $scope.data.password,
            display_name: $scope.data.fname + " " + $scope.data.lname || "",
            country: $scope.data.country,
        }).then(function (result) {
                console.log(result);
                var UserId = result.user_id;
                if (result.status == "ok") {
                    if ($scope.imagePath == null) {
                        $scope.getuserInfo(UserId);
                    } else {
                        var url = SitePath + "fileupload/upload.php";
                        var targetPath = $scope.imagePath;
                        var filename = targetPath.split("/").pop();
                        var options = {
                            fileKey: "file",
                            fileName: UserId,
                            chunkedMode: false,
                            mimeType: "image/jpg",
                        };
                        $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) {
                            console.log("SUCCESS: " + JSON.stringify(result.response));
                            console.log("this is success");
                            console.log(result);
                            $scope.getuserInfo(UserId);
                        }, function (err) {
                            $ionicLoading.hide()
                            console.log("ERROR: " + JSON.stringify(err));
                            console.log("this is error");
                            console.log(err);
                            $scope.getuserInfo(UserId);

                        }, function (progress) {
                            // console.log("progress: ")
                            // console.log(progress);
                        });
                    }

                } else {
                    $ionicLoading.hide()
                    $ionicPopup.alert({
                        title: 'Registration failed!',
                        template: result.error
                    });
                }
            },
            function (error) {
                $ionicLoading.hide()
                $ionicPopup.alert({
                    title: 'Error',
                    template: error
                });
            });

    };




    $scope.getuserInfo = function (userId) {
        Data.get("api/user/get_userinfo", {
            user_id: userId,
        }).then(function (result) {
                $ionicLoading.hide();
                if (result.status == "ok") {
                    window.localStorage.setItem("userData", JSON.stringify(result));
                    $rootScope.userData = result;

                    $rootScope.displayName = $rootScope.userData.displayname;
                    $rootScope.Avatar = $rootScope.userData.avatar;

                    $ionicViewService.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('app.notifications', {}, {
                        location: 'replace'
                    });

                } else {
                    $ionicPopup.alert({
                        title: 'Registration failed!',
                        template: result.error
                    });
                }
            },
            function (error) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: error
                });
            });
    }






})

.controller('eventdetailCtrl', function ($scope, $state, Data, $rootScope, $ionicPopup, $ionicLoading, $ionicModal, $cordovaSocialSharing) {

    root = $rootScope;
    scope = $scope;

    $scope.eventId = $state.params.Id;
    $scope.oldDate = "";
    $scope.showcomment = false;
    $scope.loaded = false;



    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
    });

    Data.get('api/saratogaapp/get_event_detail', {
        event: $scope.eventId,
        user: $rootScope.userData.id
    }).then(function (result) {
        $ionicLoading.hide();

        $scope.eventData = result.event;
        $scope.loaded = true;
        console.log("eventData");
        console.log(result.event);
        $scope.checkNotes($scope.eventId)
    }, function (error) {
        $ionicLoading.hide();
        console.log(error);
        $ionicPopup.alert({
            title: 'Error',
            template: error
        });
    });




    $ionicModal.fromTemplateUrl('templates/writecomment.html', function (modal) {
        $scope.taskModal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up'
    });


    $scope.commentSubmit = function (commentForm, newComment) {
        if (commentForm) {
            $scope.taskModal.hide();
            $ionicLoading.show({
                template: 'Sending...'
            });
            Data.get('api/saratogaapp/add_event_comment', {
                    comment: newComment,
                    event: $scope.eventId,
                    user: $rootScope.userData.id
                })
                .then(function (result) {
                    $ionicLoading.hide();
                    console.log(result);
                    if (result.comment_added) {
                        $ionicPopup.alert({
                            title: 'Thank you For Comment :)',
                            template: "Your comment has been successfully submitted and will be viewable after it has been screened for appropriateness."
                        });
                    }

                }, function (error) {
                    $ionicLoading.hide();
                    console.log(error);
                    $ionicPopup.alert({
                        title: 'Error',
                        template: error
                    });
                });
        }

    };

    // Open our new task modal
    $scope.newComment = function () {
        $scope.taskModal.show();
    }

    // Close the new task modal
    $scope.closeModel = function () {
        $scope.taskModal.hide();
    };



    $scope.checkNotes = function (eventId) {

        if (typeof $rootScope.notifications == "undefined") {
            return false;
        }

        angular.forEach($rootScope.notifications, function (value, key) {
            if (value.eventid == eventId) {
                value.is_read = true;
            }
        });
    }


    $scope.checkDate = function (date, index) {

        if (index == 0) {
            $scope.oldDate = ""
        };
        if ($scope.oldDate == date) {
            return false;
        } else {
            $scope.oldDate = date;
            return true;
        }
    }


    $scope.openLink = function (weblink) {
        console.log(weblink);
        window.open(weblink, '_system');
        return false;
    }


    $scope.gotoMap = function (lat, lng, title, address) {
        if (!lat || !lng) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Event location not available'
            });
            return false;
        }

        $rootScope.mapData = {
            lat: lat,
            lng: lng,
            title: title,
            address: address
        };

        $state.go('app.map');

    }

    // Share via native share sheet
    $scope.shareLink = function (subject, link) {
        $cordovaSocialSharing
            .share(null, subject, null, link)
            .then(function (result) {
                console.log(result);
            }, function (err) {
                // An error occured. Show a message to the user
                $ionicPopup.alert({
                    title: 'Error',
                    template: err
                });
            });
    }



    $scope.checkfav = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/favorite_event', {
            event: $scope.eventId,
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            $scope.eventData.favorite = result.favorite
            $scope.eventData.total_favorite = result.followers;


            if (typeof $rootScope.events != "undefined") {
                $rootScope.events.filter(function (el) {
                    if (el.id == $state.params.Id) {
                        el.favorite = result.favorite;
                    }
                });
            }

            if (typeof $rootScope.favourites != "undefined") {
                $rootScope.favourites.filter(function (el) {
                    if (el.id == $state.params.Id) {
                        el.favorite = result.favorite;
                    }
                });
            }


            $rootScope.setCalendar()

        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }
})









.controller('categoryCtrl', function ($scope, $state, Data, $rootScope, $ionicLoading,$ionicPopup) {
    root = $rootScope;
    console.log(typeof $rootScope.categories == "undefined");
    $scope.categories = $rootScope.categories;
    if (typeof $rootScope.categories == "undefined") {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/get_members_categories').then(function (result) {
            $scope.categories = result.categories;
            $rootScope.categories = result.categories;
            $ionicLoading.hide();
        }, function (error) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }
    $scope.toggleGroup = function (currentMenu) {
        if (currentMenu.show == false) {
            angular.forEach($scope.categories, function (value, key) {
                value.show = false;
            });
            currentMenu.show = true;
        } else {
            currentMenu.show = false;
        }
    };

})

.controller('memberCtrl', function ($scope, $state, Data, $rootScope, $ionicPopup, $ionicLoading, $ionicListDelegate) {

    root = $rootScope;
    scope = $scope;

    $scope.catId = $state.params.catId;



    $ionicListDelegate.closeOptionButtons()


    if (($scope.catId == $rootScope.catId) && (typeof $rootScope.members != "undefined")) {
        $scope.lists = $rootScope.members;
    } else {
        $scope.lists = null;
    }

    $scope.doRefresh = function () {


        // if ($state.current.name == "app.members" && $scope.lists == null) {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });

        Data.get('api/saratogaapp/get_members', {
            member_cat: $scope.catId,
            user: $rootScope.userData.id
        }).then(function (result) {

            $scope.lists = result.members || [];
            $rootScope.members = result.members;
            $rootScope.catId = $scope.catId;
            console.log(result);
        }, function (error) {

            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        }).finally(function () {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
        //  }

    }
    $scope.checkfav = function (Member) {
        console.log(Member);
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/favorite_member', {
            member: Member.id,
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            Member.favorite = result.favorite
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });

    }

    $scope.doRefresh()

})









.controller('memberdetailCtrl', function ($scope, $state, Data, $rootScope, $ionicPopup, $ionicLoading, $ionicModal, $cordovaSocialSharing, $ionicSlideBoxDelegate, $sce) {

    root = $rootScope;
    scope = $scope;
    console.log('sce');
    console.log($sce);
    $scope.memberId = $state.params.Id;
    $scope.oldDate = "";
    $scope.showcomment = false;
    $scope.commentMsg = "";
    $scope.loaded = false;
    $scope.redirecturl = SitePath;

    $ionicModal.fromTemplateUrl('templates/writecomment.html', function (modal) {
        $scope.taskModal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up'
    });



    $scope.openLink = function (weblink) {
        console.log(weblink);
        window.open(weblink, '_system');
        return false;
    }


    $scope.videoUrl = function (link) {
        return $sce.trustAsResourceUrl(link);
    }


    $scope.commentSubmit = function (commentForm, newComment) {
        if (commentForm) {
            $scope.taskModal.hide();
            $ionicLoading.show({
                template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
            });
            Data.get('api/saratogaapp/add_comment', {
                    comment: newComment,
                    member: $scope.memberId,
                    user: $rootScope.userData.id
                })
                .then(function (result) {
                    $ionicLoading.hide();
                    console.log(result);
                    if (result.comment_added) {
                        $ionicPopup.alert({
                            title: 'Thank you For Comment :)',
                            template: "Your comment has been successfully submitted and will be viewable after it has been screened for appropriateness."
                        });
                    }

                }, function (error) {
                    $ionicLoading.hide();
                    console.log(error);
                    $ionicPopup.alert({
                        title: 'Error',
                        template: error
                    });
                });
        }

    };

    // Open our new task modal
    $scope.newComment = function () {
        $scope.taskModal.show();
    }

    // Close the new task modal
    $scope.closeModel = function () {
        $scope.taskModal.hide();
    };

    $scope.checkDate = function (date, index) {

        if (index == 0) {
            $scope.oldDate = ""
        };
        if ($scope.oldDate == date) {
            return false;
        } else {
            $scope.oldDate = date;
            return true;
        }
    }


    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
    });
    
    Data.get('api/saratogaapp/get_member_detail', {
        member: $scope.memberId,
        user: $rootScope.userData.id
    }).then(function (result) {
      
        $ionicLoading.hide();
        $scope.memberData = result.member;
        $scope.loaded = true;
        console.log(result.member);
        $scope.timeout = setTimeout($scope.callNobounce, 30000)
        $ionicSlideBoxDelegate.update();

    }, function (error) {
        $ionicLoading.hide();
        console.log(error);
        $ionicPopup.alert({
            title: 'Error',
            template: error
        });
    });

    $scope.callNobounce = function () {

        if ($state.params.Id == $scope.memberId && $state.current.name == "app.member") {
            Data.get('api/saratogaapp/member_not_bounce_rate', {
                member: $scope.memberId
            }).then(function (result) {
                console.log(result);
            }, function (error) {
                console.log(error);
            });
        } else {
            console.log("nobounce");
        }


    }


    $scope.timestamp = function (time) {
        date = new Date(time + " UTC" + $scope.timezoneoffset);
        utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        var d = new Date()
        var n = d.getTimezoneOffset();
        localoffset = n / 60 * -1
        newDate = new Date(utc + (3600000 * localoffset));
        return moment(newDate).fromNow();
    }


    $scope.gotoMap = function (lat, lng, title, address) {

        if (!lat || !lng) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Member location not available'
            });
            return false;
        }

        $rootScope.mapData = {
            lat: lat,
            lng: lng,
            title: title,
            address: address
        };

        $state.go('app.map');

    }



    $scope.checkfav = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/favorite_member', {
            member: $scope.memberId,
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            $scope.memberData.favorite = result.favorite
            $scope.memberData.total_favorite = result.followers;

            if (typeof $rootScope.members != "undefined") {
                $rootScope.members.filter(function (el) {
                    if (el.id == $state.params.Id) {
                        console.log(el);
                        el.favorite = result.favorite;
                    }
                });
            }

            if (typeof $rootScope.favourites != "undefined") {
                $rootScope.favourites.filter(function (el) {
                    if (el.id == $state.params.Id) {
                        console.log(el);
                        el.favorite = result.favorite;
                    }
                });
            }



        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }

    $scope.shareLink = function (subject, link) {
        $cordovaSocialSharing
            .share(null, subject, null, link)
            .then(function (result) {
                console.log(result);
            }, function (err) {
                // An error occured. Show a message to the user
                $ionicPopup.alert({
                    title: 'Error',
                    template: err
                });
            });
    }
})




.controller('favoriteCtrl', function ($scope, $state, Data, $rootScope, $ionicPopup, $ionicLoading, $ionicListDelegate) {

    root = $rootScope;
    scope = $scope;

    $scope.favoriteList = 'member';




    $scope.doRefresh = function (startFrom) {
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/get_faviourites', {
            user: $rootScope.userData.id
        }).then(function (result) {

            $scope.favourites = result.favourites || [];
            $rootScope.favourites = result.favourites;
        }, function (error) {
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        }).finally(function () {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
    }


    $scope.checkfav = function (List) {

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });

        console.log(List.type);
        var type = 'member';
        var parms = {
            member: List.id,
            user: $rootScope.userData.id
        }
        if (List.type == 'event') {
            type = 'event'
            parms = {
                event: List.id,
                user: $rootScope.userData.id
            }
        }

        Data.get('api/saratogaapp/favorite_' + type, parms).then(function (result) {
            $ionicLoading.hide();
            if (result.status == "ok") {
                List.favorite = result.favorite
            } else {
                $ionicPopup.alert({
                    title: 'Error',
                    template: result.error
                });
            }
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }


    $scope.doRefresh();
})





.controller('connectionCtrl', function ($scope, $state, $rootScope, Data, $ionicLoading, $ionicPopup, $ionicListDelegate) {

    scope = $scope;
    $scope.searchData;
    $scope.ConnectedList = true;
    $ionicListDelegate.closeOptionButtons();
    // $scope.connections = [];
    // $rootScope.connections;

    $scope.doRefresh = function (startFrom) {
        console.log("start : " + startFrom);
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/get_connection', {
            user: $rootScope.userData.id,
        }).then(function (result) {

            console.log(result);
            $scope.listConnect = result.connections || []
            $rootScope.listConnect = result.connections

            $scope.connections = result.connections || [];
            $rootScope.connections = result.connections;
        }, function (error) {
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        }).finally(function () {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.checkConnect = function (connection, type) {

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/connect_user', {
            connectto: connection.ID,
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            connection.connected = result.connected
            if (type == "search") {
                var cnt = 0;
                angular.forEach($scope.connections, function (el, index) {
                    
                    if (el.ID == connection.ID) {
                        el.connected = result.connected
                        cnt++;
                    }
                });

                if (cnt == 0) {
                    $scope.connections.push(connection);
                }

                $rootScope.connections = $scope.connections;
            }

        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }


    $scope.search = function (isvalid) {
        $scope.formsubmit = false;
        console.log($scope.connectData);

        if (!isvalid) {
            $scope.popup = $ionicPopup.alert({
                title: 'User search faild!',
                template: 'Please input keyword to search User!'
            });

            return false;
        }

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });

        Data.get('api/saratogaapp/search_user', {
            search_key: $scope.connectData,
            user: $rootScope.userData.id
        }).then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            $scope.formsubmit = true;
            $scope.searchConnect = result.connections || [];
            $rootScope.searchConnect = result.connections;
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    console.log($rootScope.connections);
    if (typeof $rootScope.connections == "undefined") {
        $scope.doRefresh()
    }
})

.controller('settingCtrl', function ($scope, $state, $rootScope, Data, $ionicLoading, $ionicPopup) {

    root = $rootScope;
    scope = $scope;
    $scope.noanimation = false;
    $scope.loaded = false;

    console.log($rootScope.settings);

    if (typeof $rootScope.settings != "undefined") {
        $scope.noanimation = true;
        $scope.settings = $rootScope.settings
    } else {

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/get_settings', {
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            console.log(result.settings);
            $rootScope.settings = result.settings;
            $scope.settings = result.settings;
            $scope.loaded = true;
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }


    $scope.checkSetting = function () {
        console.log($scope.settings);

        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/set_settings', {
            user: $rootScope.userData.id,
            settings: $scope.settings
        }).then(function (result) {
            $ionicLoading.hide();
            console.log(result);
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }



})




.controller('weatherCtrl', function ($scope, $state, $rootScope, $http, $ionicLoading, $ionicPopup, $ionicSlideBoxDelegate) {

    $scope.hidenext = false;
    $scope.hideprev = true;
    $scope.weatherIcon;

    /*    ng-class="{Cloudy:'wi-cloudy','Mostly Cloudy':'wi-cloudy', Thunderstorms:'wi-thunderstorm','PM Thunderstorms':'wi-thunderstorm', Rain:'wi-rain','AM Rain':'wi-rain','Heavy Rain':'wi-rain',Showers:'wi-showers','Light Rain':'wi-rain-mix','Heavy Thunderstorms':'wi-thunderstorm'}[slide.text]" */

    $scope.setIcon = function (txt) {
        if (txt == 'Cloudy' || txt == 'Mostly Cloudy') {
            return 'wi-cloudy';
        } else if (txt == 'Thunderstorms' || txt == 'PM Thunderstorms' || txt == 'Heavy Thunderstorms') {
            return 'wi-thunderstorm';
        } else if (txt == 'Rain' || txt == 'AM Rain' || txt == 'Heavy Rain') {
            return 'wi-rain';
        } else if (txt == 'Showers' || txt == 'AM Rain' || txt == 'Heavy Rain') {
            return 'wi-showers';

        } else if (txt == 'Light Rain') {
            return 'wi-rain-mix';
        } else if (txt == 'Sunny') {
            return 'wi-day-sunny';
        } else {
            return 'wi-day-cloudy';
        }




    }

    $scope.slideChanged = function (index) {



        $scope.hidenext = false;
        $scope.hideprev = false;
        if (index == 0) {
            $scope.hideprev = true;
        }
        if (index == ($ionicSlideBoxDelegate.slidesCount() - 1)) {
            $scope.hidenext = true;
        }

    }
    $scope.slideNext = function () {
        $ionicSlideBoxDelegate.next();
    };
    $scope.slidePrev = function () {
        $ionicSlideBoxDelegate.previous();
    };


    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
    });
    $http.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22nome%2C%20saratoga%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys').then(function (weather) {
        $ionicLoading.hide();
        console.log("weather");
        $scope.weatherReport = weather.data.query.results.channel;
        console.log($scope.weatherReport);
        $ionicSlideBoxDelegate.update();
        // For JSON responses, resp.data contains the result
    }, function (error) {
        // err.status will contain the status code
        $ionicLoading.hide();
        $ionicPopup.alert({
            title: 'Error',
            template: error
        });

    })


})


.controller('mapCtrl', function ($scope, $state, $cordovaGeolocation, $rootScope) {

    root = $rootScope;
    scope = $scope;

    $scope.lat = $rootScope.mapData.lat;
    $scope.lng = $rootScope.mapData.lng;
    $scope.title = $rootScope.mapData.title;
    $scope.address = $rootScope.mapData.address;
    clocat = $cordovaGeolocation
    $scope.cpos = null;




    $scope.openLink = function () {
        //console.log('https://maps.google.com?daddr='+$scope.address);
        //window.open('https://maps.google.com?daddr='+$scope.address, '_system');
        launchnavigator.navigate($scope.address, null, function () {
            console.log("open navigation success")
        }, function (error) {
            console.log(error);
        }, options);

        return false;
    }



    var options = {
        timeout: 10000,
        enableHighAccuracy: true
    };

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var latLng = new google.maps.LatLng($scope.lat, $scope.lng);

    var mapOptions = {
        center: latLng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng,
        icon: 'img/marker-royal.png'
    });

    infoBubble = new InfoBubble({
        content: '<div class="bubble-text"><h2>' + $scope.title + '</h2><h4>' + $scope.address + '</h4></div>',
        position: new google.maps.LatLng(37, -121),
        shadowStyle: 1,
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'rgb(78,56,94)',
        arrowSize: 10,
        maxWidth: 300,
        minWidth: 250,
        minHeight: 70,
        borderWidth: 1,
        borderColor: '#fff',
        disableAutoPan: true,
        hideCloseButton: true,
        arrowPosition: 50,
        arrowSize: 15,
        backgroundClassName: 'bubble',
        arrowStyle: 0
    });

    var tmp = false;
    google.maps.event.addListener(marker, 'click', function () {
        if (!tmp) {
            infoBubble.open($scope.map, marker);
            tmp = true
        } else {
            infoBubble.close();
            tmp = false
        }
    });





})


.controller('calenderCtrl', function ($scope, $state, $rootScope, Data, $ionicLoading, $ionicPopup, $ionicListDelegate, $ionicScrollDelegate) {

    root = $rootScope;
    scope = $scope;
    $scope.lists = [];


    $scope.day = moment();
    $scope.selected = moment();
    $scope.monthCnt = moment().month();

    $ionicListDelegate.closeOptionButtons()






    $scope.checkfav = function (Event) {
        console.log(Event);
        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/favorite_event', {
            event: Event.id,
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            console.log(Event);
            Event.favorite = result.favorite;
            $rootScope.setCalendar()
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });

    }


    $scope.checkDate = function (date, index, multiday) {
        if (index == 0) {
            $scope.oldDate = ""
        };

        if ($scope.oldDate == date) {
            return false;
        } else if (!multiday) {
            $scope.oldDate = date;
            return true;
        } else {
            return true;
        }
    }

    $scope.checkList = function (list) {

        var startDate = new Date(list.star_date);
        var endDate = new Date(list.end_date);

        if (typeof $scope.todayVal == "undefined" && list.favorite) {
            return true;
        } else {
            var result = startDate.valueOf() <= $scope.todayVal && endDate.valueOf() >= $scope.todayVal;
            return result;
        }
    }

    $scope.doRefresh = function () {

        Data.get('api/saratogaapp/get_eventlist', {
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            $scope.lists = result.events;
            console.log($scope.lists)
            $rootScope.events = result.events;
            console.log(result.events);
            $rootScope.setCalendar()
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
    });
    $scope.doRefresh();



    // Calendar Events 



    $rootScope.setCalendar = function () {
        $scope.month = $scope.selected.clone();
        console.log($scope.month);
        var start = $scope.selected.clone();
        start.date(1);
        _removeTime(start.day(0));

        _buildMonth($scope, start, $scope.month);

        $scope.select = function (day) {

            if (day.eventStatus.eventDay) {
                $scope.selected = day.date;
                $scope.todayVal = day.date.valueOf();
                //console.log("todayVal : " + todayVal);
            }
            $ionicScrollDelegate.resize();
        };

        $scope.next = function () {
            var next = $scope.month.clone();
            _removeTime(next.month(next.month() + 1).date(1));
            $scope.month.month($scope.month.month() + 1);
            _buildMonth($scope, next, $scope.month);

        };

        $scope.previous = function () {
            var previous = $scope.month.clone();
            _removeTime(previous.month(previous.month() - 1).date(1));
            $scope.month.month($scope.month.month() - 1);
            _buildMonth($scope, previous, $scope.month);
        };
    }

    function _removeTime(date) {
        return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildMonth($scope, start, month) {
        $scope.weeks = [];
        var done = false,
            date = start.clone(),
            monthIndex = date.month(),
            count = 0;

        while (!done) {
            $scope.weeks.push({
                days: _buildWeek(date.clone(), month)
            });
            date.add(1, "w");
            done = count++ > 2 && monthIndex !== date.month();
            monthIndex = date.month();
        }
    }

    function _buildWeek(date, month) {

        var days = [];
        for (var i = 0; i < 7; i++) {
           
            days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                eventStatus: checkEvents(date),
                date: date,
               // oldDate: date._d < moment("01 00-00-00", "DD HH:mm:ss")._d
            });
          
            date = date.clone();
            date.add(1, "d");
            // console.log(days);
        }

        return days;
    }

    function checkEvents(date) {

        var status = {
            eventDay: false,
            favEvent: false,
            subEvent: false,
        };

        angular.forEach($scope.lists, function (value, key) {
            var startDate = new Date(value.star_date);
            var endDate = new Date(value.end_date);


            if (startDate.valueOf() <= date.valueOf() && endDate.valueOf() >= date.valueOf()) {
                status.eventDay = true;

                if (value.member_favorite || value.is_category) {
                    status.subEvent = true;
                }
                if (value.favorite) {
                    status.favEvent = true;
                }
            }
        });

        return status;
    }
})


.controller('notifyCtrl', function ($scope, $state, $rootScope, Data, $ionicLoading, $ionicPopup) {

    root = $rootScope;
    scope = $scope;

    $scope.timestamp = function (time) {
        var utcTimezone = ($scope.timezoneoffset * 100)
        date = new Date(time + " UTC" + utcTimezone);
        return moment(date).fromNow();
    }


    $scope.readNotes = function (note) {

        if (!note.eventid && !note.is_read) {
            Data.get('api/saratogaapp/read_notification', {
                notificationid: note.notificationid,
                userid: $rootScope.userData.id
            }).then(function (result) {
                console.log(result);
                if (result.status == "ok") {
                    note.is_read = true
                    $scope.checkBadge($rootScope.notifications);
                }

            }, function (error) {
                $ionicLoading.hide();
                console.log(error);
                $ionicPopup.alert({
                    title: 'Error',
                    template: error
                });
            })
        }

        if (note.externallink) {
            console.log(note.externallink);

            window.open(note.externallink, '_system');


            note.is_read = true
        }

    }

    $scope.checkBadge = function (notifications) {
        var cnt = 0;
        console.log("test this is new test");
        angular.forEach(notifications, function (value, key) {
            console.log();
            if (!value.is_read) {
                cnt++;
            }
        });
        $scope.badge = cnt;
        $rootScope.badge = cnt;
        if (cnt < 1) {
            $scope.badge = "";
            $rootScope.badge = "";
        }
        console.log("badge :" + cnt);
    }





    $scope.doRefresh = function () {

        Data.get('api/saratogaapp/get_all_notification', {
            userid: $rootScope.userData.id
        }).then(function (result) {
            console.log(result.timezoneoffset);
            $ionicLoading.hide();
            $scope.timezoneoffset = result.timezoneoffset;
            $scope.notifications = result.notifications;
            $rootScope.notifications = result.notifications;
            console.log(result);
            $scope.checkBadge($rootScope.notifications);
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
    });

    $scope.doRefresh()

    if (typeof $rootScope.settings == "undefined") {
        Data.get('api/saratogaapp/get_settings', {
            user: $rootScope.userData.id
        }).then(function (result) {
            $ionicLoading.hide();
            console.log(result.settings);
            $rootScope.settings = result.settings;
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        });
    }
})

.controller('searchCtrl', function ($scope, $state, $rootScope, Data, $ionicLoading, $ionicPopup) {
    $scope.formsubmit = false;
    $scope.search = function (isvalid) {
        $scope.formsubmit = false;
        console.log(isvalid);
        if (!isvalid) {
            $scope.popup = $ionicPopup.alert({
                title: 'Search faild!',
                template: 'Please input keyword to search!'
            });
            return false;
        }



        $ionicLoading.show({
            template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
        });
        Data.get('api/saratogaapp/get_search_resutl', {
            search: $scope.searchData
        }).then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            $scope.formsubmit = true;
            $scope.searchresult = result.searchresult;
            $rootScope.searchresult = result.searchresult;
        }, function (error) {
            $ionicLoading.hide();
            console.log(error);
            $ionicPopup.alert({
                title: 'Error',
                template: error
            });
        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

})

.controller('statsCtrl', function ($scope, $state, $rootScope, Data, $ionicLoading, $ionicPopup) {


    $scope.getPer = function (val1, val2) {
        var totalPer = Math.round((val1 * 100) / (val1 + val2));
        return totalPer + "%";

    }


    $scope.doRefresh = function () {
        Data.get('api/saratogaapp/member_statistic', {
            user: $rootScope.userData.id
        }).then(function (result) {
            console.log(result);
            $ionicLoading.hide();
            $scope.statsresult = result.stat_result;
            $rootScope.statsresult = result.searchresult;

            $scope.barchart = $scope.statsresult.barchart;
            $scope.click_through = $scope.statsresult.click_through;
            $scope.bounce = $scope.statsresult.bounce;
            $scope.pushnotification = $scope.statsresult.pushnotification;
            $scope.follower = $scope.statsresult.follower;
            barchart = $scope.barchart

        }, function (error) {
            $ionicLoading.hide();

            $ionicPopup.alert({
                title: 'Error',
                template: error
            });

        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="custom-icon"></ion-spinner>'
    });

    $scope.doRefresh();
})





//KGN@0@0@8888
