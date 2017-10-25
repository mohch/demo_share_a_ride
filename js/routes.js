
angular
.module('app')
.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$breadcrumbProvider', function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $breadcrumbProvider) {
  $urlRouterProvider.otherwise('/root_view')

  $ocLazyLoadProvider.config({
    // Set to true if you want to see what and when is dynamically loaded
    debug: true
  })

  $breadcrumbProvider.setOptions({
    prefixStateName: 'app.main',
    includeAbstract: true,
    template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
  })

  $stateProvider
  .state('app', {
    abstract: true,
    templateUrl: 'views/common/layouts/full.html',
    // page title goes here
    ncyBreadcrumb: {
      label: 'Root',
      skip: true
    },
    resolve: {
      loadCSS: ['$ocLazyLoad', function ($ocLazyLoad) {
        // you can lazy load CSS files
        return $ocLazyLoad.load([{
          serie: true,
          name: 'Font Awesome',
          files: ['css/font-awesome.min.css']
        }, {
          serie: true,
          name: 'Simple Line Icons',
          files: ['css/simple-line-icons.css']
        }])
      }],
      loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
        // you can lazy load files for an existing module
        return $ocLazyLoad.load([{
          serie: true,
          name: 'chart.js',
          files: [
            'bower_components/chart.js/dist/Chart.min.js',
            'bower_components/angular-chart.js/dist/angular-chart.min.js'
          ]
        }])
      }]
    },
    controller: 'appMainCtrl'
  })
  .state('appSimple', {
    abstract: true,
    templateUrl: 'views/common/layouts/simple.html',
    resolve: {
      loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
        // you can lazy load files for an existing module
        return $ocLazyLoad.load([{
          serie: true,
          name: 'Font Awesome',
          files: ['css/font-awesome.min.css']
        }, {
          serie: true,
          name: 'Simple Line Icons',
          files: ['css/simple-line-icons.css']
        }])
      }]
    }
  })

  // Additional Pages
  .state('appSimple.login', {
    url: '/login',
    templateUrl: 'views/pages/login.html',
    controller: 'LoginCtrl'
  })
  .state('appSimple.choose_user', {
    url: '/user_choice',
    templateUrl: 'views/pages/choose_user.html',
    controller: 'chooseUserCtrl'
  })
  .state('appSimple.pickup_point', {
    url: '/pickup_point',
    templateUrl: 'views/pages/choose_pickuppoint.html',
    controller: 'PickupPointCtrl'
  })
  .state('appSimple.cbooking_confirmed', {
    url: '/commuter/booking/:name/:number/:car/:gate_lat/:gate_long',
    templateUrl: 'views/pages/c_booking_confirmed.html',
    controller: 'cBookingCtrl'
  })
  .state('appSimple.dbooking_confirmed', {
    url: '/driver/booking/:seats',
    templateUrl: 'views/pages/d_booking_confirmed.html',
    controller: 'dBookingCtrl'
  })
  .state('appSimple.register', {
    url: '/register',
    templateUrl: 'views/pages/register.html'
  })
  .state('appSimple.404', {
    url: '/404',
    templateUrl: 'views/pages/404.html'
  })
    .state('appSimple.root_view', {
      url : '/root_view'
  })
  .state('appSimple.500', {
    url: '/500',
    templateUrl: 'views/pages/500.html'
  })
}])
