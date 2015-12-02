/**
 * Created by igi on 10.11.15.
 */
"use strict";

angular.module('greyscale.core', ['restangular'])
    .config(function (RestangularProvider, greyscaleEnv) {
        RestangularProvider.setBaseUrl(greyscaleEnv.baseServerUrl);
        RestangularProvider.setDefaultHttpFields({
            cache: false,
            withCredentials: false
        });
    });
