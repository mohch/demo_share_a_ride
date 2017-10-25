// controller.js
function Uint8ToString (u8a) {
  var CHUNK_SZ = 0x8000
  var c = []
  for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)))
  }
  return c.join('')
}

var randomString = function (length) {
  var str = ''
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split(
    '')
    var charsLen = chars.length
    if (!length) {
      length = ~~(Math.random() * charsLen)
    }
    for (var i = 0; i < length; i++) {
      str += chars[~~(Math.random() * charsLen)]
    }
    return str
  }

  function percentageToHsl (percentage, hue0, hue1) {
    var hue = (percentage * (hue1 - hue0)) + hue0  // (0-90)) + 90
    return 'hsl(' + hue + ', 100%, 50%)'
  }

  angular.module('app').filter('score_filter', function () {
    return function (score) {
      if (score > 0) {
        return Number(((score / 10).toFixed(1)))
      } else {
        return '-'
      }
    }
  })

  angular.module('app').filter('ISOdatefilter', function () {
    return function (date) {
      var date_ms = +new Date(date)
      if (date_ms > 1000) {
        return date
      } else {
        return '-'
      }
    }
  })
  angular.module('app').filter('trip_distance_filter', function () {
    return function (value) {
      if (value > 0) {
        return value
      } else {
        return '-'
      }
    }
  })
  angular.module('app').filter('only_positive_values', function () {
    return function (value) {
      if (value >= 0) {
        return value
      } else {
        return '-'
      }
    }
  })
  angular.module('app').filter('only_positive_battery_values', function () {
    return function (value) {
      if (value >= 0 && value < 101) {
        return value + '%'
      } else {
        return '-'
      }
    }
  })
  angular.module('app').filter('unix_date_filter', function () {
    return function (value) {
      value = Number(value)
      if (value > 1000) {
        return value
      } else {
        return '-'
      }
    }
  })
  angular.module('app').filter('mstohours', function () {
    return function (milliseconds) {
      if (milliseconds > 60000) {
        var hours = milliseconds / (1000 * 60 * 60)
        var absoluteHours = Math.floor(hours)
        var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours

        // Get remainder from hours and convert to minutes
        var minutes = (hours - absoluteHours) * 60
        var absoluteMinutes = Math.floor(minutes)
        var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes

        // Get remainder from minutes and convert to seconds
        var seconds = (minutes - absoluteMinutes) * 60
        var absoluteSeconds = Math.floor(seconds)
        var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds

        if (h > 0) {
          if (h > 1 && m > 1) {
            return h + ' hours ' + m + ' minutes'
          } else if (h < 1 && m > 1){
            return h + ' hour ' + m + ' minutes'
          }
          else if(h > 1 && m < 1)
          {
            return h + ' hours ' + m + ' minute'
          }
          else
          {
            return h + ' hour ' + m + ' minute'
          }
        } else {
          if (m > 1) {
            return m + ' minutes'
          } else {
            return m + ' minute'
          }
        }
      } else {
        return '-'
      }
    }
  })

  angular
  .module('app')
  .controller('LoginCtrl', function ($rootScope, $timeout, $http, $cookies, $window, $state, $stateParams, $scope) {
    $scope.user = {}
    $cookies.remove('cluster', {path: '/'})
    $cookies.remove('name', {path: '/'})
    $cookies.remove('address_lat', {path: '/'})
    $cookies.remove('address_long', {path: '/'})
    $cookies.remove('employee_id', {path: '/'})
    $scope.login = function () {
      console.log($scope.user)
      var userEmail = $scope.user.employee_id
      var userPassword = $scope.user.user_password
      $scope.wrongInput = false
      $scope.incorrectDetails = false
      console.log('UserEmail', userEmail)
      console.log('UserPassword', userPassword)
      if (userEmail == undefined) {
        $scope.wrongInput = true
      } else {
        $scope.incorrectDetails = false
        $http({
          method: 'POST',
          url: '/login',
          data : $scope.user
        }).then(function successCallback(response) {
          console.log(response);
            if (response.data.status == 200)
            {
              $cookies.put('cluster', response.data.data.cluster, {path: '/'})
              $cookies.put('name', response.data.data.name, {path: '/'})
              $cookies.put('address_lat', response.data.data.address[0], {path: '/'})
              $cookies.put('address_long', response.data.data.address[1], {path: '/'})
              $cookies.put('employee_id', userEmail, {path: '/'})
              $state.go('appSimple.choose_user')
            }
            else
            {
              $scope.incorrectDetails = true
            }
          }, function errorCallback(response) {

          });
      }
    }
  })
  angular
  .module('app')
  .controller('chooseUserCtrl', function ($rootScope, $timeout, $http, $cookies, $window, $state, $stateParams, $scope) {
    $scope.user = {}
    $scope.employee_name = $cookies.get('name');
    $scope.main_window = true;  
    $scope.select_driver = function()
    {
      console.log('select Driver');
      $scope.main_window = false;
    }

    $scope.shareride = function(seats)
    {
      var seats = $scope.user.seats;
      if (seats >= 1)
      {
        var employee_id = $cookies.get('employee_id');
        var cluster = $cookies.get('cluster');
        var send_obj = {employee_id : employee_id, cluster : cluster, seats : seats};
        $http({
          method: 'POST',
          url: '/d/share_a_ride',
          data : send_obj
        }).then(function successCallback(response) {
            if (response.data.status == 200)
            {
              $state.go('appSimple.dbooking_confirmed', {seats: seats});
            }
          }, function errorCallback(response) {

          });
      }
      else
      {
        alert('Invalid Input');
      } 
    }

    $scope.select_commuter = function()
    {
      $state.go('appSimple.pickup_point')
      console.log('select Commuter');
    }
  })
  angular
  .module('app')
  .controller('PickupPointCtrl', function ($scope, $http, $cookies, $window, $rootScope, NgMap, $state, $stateParams) {
    var map_g
    NgMap.getMap().then(function (map) {
      console.log('map', map)
      map_g = map
    })
    $scope.resizefun = function()
    {
      console.log('resize');
    }
    $scope.gatename = "";
    $scope.showSpinner = false; 
    var gate_name, gate_lat, gate_long;  
    $scope.toggleBounce = function(data, x) {
      console.log(data);
      console.log(x);
      $scope.gatename = x.name;
      gate_name = x.name;
      gate_lat = x.coordinates[0];
      gate_long = x.coordinates[1];
      map_g = this;
      if (this)
      {
        this.setAnimation(null);
        currentmarker = this;
        if (currentmarker.getAnimation() != null) {
          currentmarker.setAnimation(null);
        } else {
          currentmarker.setAnimation(google.maps.Animation.BOUNCE);
        }
      }
    }

    function book_my_cab ()
    {
      var employee_id = $cookies.get('employee_id');
      var cluster = $cookies.get('cluster');
      var send_obj = {employee_id : employee_id, cluster : cluster, gate : gate_name, gate_lat : gate_lat, gate_long : gate_long};
      $http({
        method: 'POST',
        url: '/c/book_a_ride',
        data : send_obj
      }).then(function successCallback(response) {
         console.log('Book my cab response', response);
         if(response.data.status == 200)
         {
          $scope.showSpinner = false;
          $state.go('appSimple.cbooking_confirmed', {name: response.data.data.name, 
                                                     number : response.data.data.number,
                                                     car : response.data.data.car,
                                                     gate_lat : gate_lat,
                                                     gate_long : gate_long 
                                                     });
         }
         else
         {
          $scope.showSpinner = true; 
          book_my_cab();
         }
        }, function errorCallback(response) {

        });
    }
    $scope.book_my_ride = function()
    {
      $scope.showSpinner = true; 
      book_my_cab();
    }

    $scope.gates_data = [{name : 'Gate 1', coordinates : [19.126614, 73.004805]},{name : 'Gate 2', coordinates : [19.127141, 73.015126]},{name : 'Gate 3', coordinates : [19.124282, 73.005341]},{name : 'Gate 4', coordinates : [19.124708, 73.015212]},{name : 'Gate 5', coordinates : [19.127952, 73.010019]}];
    var lat = [19.126614, 19.127141, 19.124282, 19.124708, 19.127952];
    var long = [73.004805, 73.015126, 73.005341, 73.015212, 73.010019];
        var lat_max = lat.reduce(function (a, b) {
          return Math.max(a, b)
        })
        var long_max = long.reduce(function (a, b) {
          return Math.max(a, b)
        })
        var lat_min = lat.reduce(function (a, b) {
          return Math.min(a, b)
        })
        var long_min = long.reduce(function (a, b) {
          return Math.min(a, b)
        })
        console.log(lat_max, lat_min, long_max, long_min)
        $scope.mapcenterlat = ((lat_max + lat_min) / 2.0)
        $scope.mapcenterlong = ((long_max + long_min) / 2.0)
        var angle = long_max - long_min
        if (angle < 0) {
          angle += 360
        }
        var GLOBE_WIDTH = 256
        var zoomfactor = Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2)
        console.log('Zomo', zoomfactor)
        $scope.mapzoom = zoomfactor - 2
  })
  angular
  .module('app')
  .controller('cBookingCtrl', function ($scope, $http, $cookies, $window, $rootScope, NgMap, $state, $stateParams) {
    var map_g
    NgMap.getMap().then(function (map) {
      console.log('map', map)
      map_g = map
    })
    $scope.resizefun = function()
    {
      console.log('resize');
    }

    //$scope.driver_data = {name : 'Demo Driver', number : '7826162616', car : 'Maruti Suzuki White, MH 4712 2123'};
    var name = $stateParams.name;
    var number = $stateParams.number;
    var car = $stateParams.car;
    var gate_lat = $stateParams.gate_lat;
    var gate_long = $stateParams.gate_long;
    var address_lat = $cookies.get('address_lat');
    var address_long = $cookies.get('address_long');
    var lat = [gate_lat,address_lat];
    var long = [address_long, gate_long];
    $scope.leave_now = false;
    $scope.driver_data = {name : name, number : number, car : car};
        var lat_max = lat.reduce(function (a, b) {
          return Math.max(a, b)
        })
        var long_max = long.reduce(function (a, b) {
          return Math.max(a, b)
        })
        var lat_min = lat.reduce(function (a, b) {
          return Math.min(a, b)
        })
        var long_min = long.reduce(function (a, b) {
          return Math.min(a, b)
        })
        console.log(lat_max, lat_min, long_max, long_min)
        $scope.mapcenterlat = ((lat_max + lat_min) / 2.0)
        $scope.mapcenterlong = ((long_max + long_min) / 2.0)
        var angle = long_max - long_min
        if (angle < 0) {
          angle += 360
        }
        var GLOBE_WIDTH = 256
        var zoomfactor = Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2)
        console.log('Zomo', zoomfactor, lat_min, lat_max)
        $scope.mapzoom = zoomfactor - 3
        var employee_id = $cookies.get('employee_id');
        initialload();
        function initialload() 
        {
          $http({
            method: 'POST',
            url: '/commuter/seat_confirmation',
            data : {employee_id : employee_id}
          }).then(function successCallback(response) {
            console.log('response commuter', response.data);
              if (response.data.status == 200)
              {
                $scope.leave_now = false; 
                initialload();
              }
              else
              {
                $scope.leave_now = true;
              }
            }, function errorCallback(response) {

            });
        };
  })
  angular
  .module('app')
  .controller('dBookingCtrl', function ($scope, $http, $cookies, $window, $rootScope, NgMap, $state, $stateParams,) {
        var seats = $stateParams.seats;
        var employee_id = $cookies.get('employee_id');
        $scope.window1 = true;
        $scope.showSpinner = false; 
        initial_load();
        function initial_load()
        {
          $http({
            method: 'POST',
            url: '/driver/booking_confirmation',
            data : {employee_id : employee_id}
          }).then(function successCallback(response) {
            console.log(response);
              if (response.data.status == 200 && response.data.seats_count == seats)
              {
                $scope.showSpinner = false; 
                var user_data = response.data.data; 
                $scope.user_data = user_data;
                var lat = new Array();
                var long = new Array();
                for (var i = 0; i < user_data.length; i++)
                {
                  lat.push(user_data[i].coordinates[0]);
                  long.push(user_data[i].coordinates[1]);
                }                
                var lat_max = lat.reduce(function (a, b) {
                  return Math.max(a, b)
                })
                var long_max = long.reduce(function (a, b) {
                  return Math.max(a, b)
                })
                var lat_min = lat.reduce(function (a, b) {
                  return Math.min(a, b)
                })
                var long_min = long.reduce(function (a, b) {
                  return Math.min(a, b)
                })
                console.log(lat_max, lat_min, long_max, long_min)
                $scope.mapcenterlat = ((lat_max + lat_min) / 2.0)
                $scope.mapcenterlong = ((long_max + long_min) / 2.0)
                var angle = long_max - long_min
                if (angle < 0) {
                  angle += 360
                }
                var GLOBE_WIDTH = 256
                var zoomfactor = Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2)
                console.log('Zomo', zoomfactor, lat_min, lat_max)
                $scope.mapzoom = zoomfactor - 2

              }
              else if (response.data.status == 200 && response.data.seats_count < seats)
              {
                $scope.showSpinner = true; 
                var user_data = response.data.data; 
                console.log(user_data);
                $scope.user_data = user_data;
                var lat = new Array();
                var long = new Array();
                for (var i = 0; i < user_data.length; i++)
                {
                  lat.push(user_data[i].coordinates[0]);
                  long.push(user_data[i].coordinates[1]);
                }                
                var lat_max = lat.reduce(function (a, b) {
                  return Math.max(a, b)
                })
                var long_max = long.reduce(function (a, b) {
                  return Math.max(a, b)
                })
                var lat_min = lat.reduce(function (a, b) {
                  return Math.min(a, b)
                })
                var long_min = long.reduce(function (a, b) {
                  return Math.min(a, b)
                })
                console.log(lat_max, lat_min, long_max, long_min)
                $scope.mapcenterlat = ((lat_max + lat_min) / 2.0)
                $scope.mapcenterlong = ((long_max + long_min) / 2.0)
                var angle = long_max - long_min
                if (angle < 0) {
                  angle += 360
                }
                var GLOBE_WIDTH = 256
                var zoomfactor = Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2)
                console.log('Zomo', zoomfactor, lat_min, lat_max)
                $scope.mapzoom = zoomfactor - 2
                initial_load();
              }
              else
              {
                $scope.showSpinner = true; 
                initial_load();
              }
            }, function errorCallback(response) {

            });
        }

        $scope.leavenow = function()
        {
          var employee_id = $cookies.get('employee_id');
          var send_obj = {driver_id : employee_id};
          $http({
            method: 'POST',
            url: '/driver/leave_now',
            data : send_obj
          }).then(function successCallback(response) {
            console.log(response);
            $scope.window1 = false;
            }, function errorCallback(response) {
              console.log(response);
            });
        };              
        var map_g
        NgMap.getMap().then(function (map) {
          console.log('map', map)
          map_g = map
        })
   
  })
