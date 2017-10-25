var express = require('express')
var app = express()
var bodyparser = require('body-parser')
app.use(bodyparser.json({
    limit: '50mb'
}));
app.use(bodyparser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(express.static(__dirname + '/'))
app.use(express.static(__dirname + '/bower_components'))
app.use(express.static(__dirname + '/config'))
app.use(express.static(__dirname + '/css'))
app.use(express.static(__dirname + '/fonts'))
app.use(express.static(__dirname + '/img'))
app.use(express.static(__dirname + '/img/maps'))
app.use(express.static(__dirname + '/js'))
app.use(express.static(__dirname + '/node_modules'))
app.use(express.static(__dirname + '/scss'))
app.use(express.static(__dirname + '/views'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})



var demo_map = {
    'vibhanshu': {
        password: 'xyz',
        cluster: 'test_1',
        name: 'Vibhanshu',
        number : 9625125212,
        address: [18.906703, 72.814712],
        car : 'Maruti Suzuki White, MH 4712 2123'
    },
    'shubham': {
        password: 'xyz',
        cluster: 'test_1',
        name: 'Shubham',
        number : 7652712371,
        address: [18.987202, 72.829046],
        car : 'Maruti Suzuki Blue, MH 4712 2123'
    },
    'akshay': {
        password: 'xyz',
        cluster: 'test_1',
        name: 'Akshay',
        number : 8762517263,
        address: [18.925573, 72.824222],
        car : 'Maruti Suzuki Black, MH 4712 2123'
    }
};
app.post('/login', function(req, res) {
    console.log('Login request', req.body);
    var employee_id = req.body.employee_id;
    if (demo_map[employee_id]) {
        res.json({
            status: 200,
            data: demo_map[employee_id]
        });
    } else {
        res.json({
            status: 400,
            message: 'User do not exist'
        });
    }
});

app.post('/commuter/seat_confirmation', function(req, res) {
    var data = req.body; 
    var employee_id = data.employee_id;
    if (employee_id)
    {
        var model_path = require('./model/booking.js');
        var booking_model = model_path.booking_model;
        booking_model.count({commuter_id : employee_id, status : true}, function(err, count) {
            if (err) {
                console.error('Error - events', err);
                res.json({status : 301, message : 'Error while fetching data'});
            } else {
                if (count > 0)
                {
                    res.json({status : 200, message : 'Driver is ready to leave'});
                }
                else
                {
                    res.json({status : 201, message : 'Driver is still waiting'});
                }
            }
        });
    } 
    else
    {
        res.json({status : 300, message : 'Incomplete Input'});
    }
});

app.post('/driver/leave_now', function(req, res) {
    var data = req.body; 
    var driver_id = data.driver_id;
    var model_path = require('./model/booking.js');
    var booking_model = model_path.booking_model;
    booking_model.update({
    'driver_id': driver_id
    }, {
     '$set': {
       status :false
     }
    }, {multi: true} , function(err, result) {
        if (err) {
            console.error('Problem while updating value - leave now : ', err); 
            res.json({status : 400, message : 'Server error'}); 
        } else {
            res.json({status : 200, message : 'Values changed in the booking'}); 
            
        }
    }); 
});

app.post('/driver/booking_confirmation', function(req, res) {
    var data = req.body; 
    var employee_id = data.employee_id;
    var model_path = require('./model/booking.js');
    var booking_model = model_path.booking_model; 
    booking_model.find({driver_id : employee_id, status : true}, function(err, data) {
        if (err) {
            console.error('Error - events', err);
        } else {
            if (data.length > 0)
            {
                res.json({status : 200, seats_count : data.length, data: data});
            }
            else
            {
                res.json({status : 400, message : 'No Booking found'});
            }
        }
    });
});
app.post('/d/share_a_ride', function(req, res) {
    var data = req.body;

    var employee_id = data.employee_id;
    var cluster = data.cluster;
    var seats = data.seats;
    if (employee_id && cluster && seats) {
        addDrivertoCluster(cluster, seats, employee_id)
            .then(result => {
                if (result == true) {
                    res.json({
                        status: 200,
                        message: 'request registered'
                    });
                } else {
                    res.json({
                        status: 301,
                        message: 'Error while adding values to redis'
                    });
                }
            })
            .catch(error => {
                res.json({
                    status: 400,
                    message: 'Bad server error'
                });
            });
    } else {
        res.json({
            status: 300,
            message: 'Incomplete Input'
        });
    }
});

app.post('/c/book_a_ride', function(req, res) {
    var data = req.body;

    var employee_id = data.employee_id;
    var cluster = data.cluster;
    var gate = data.gate;
    var gate_coordinates = [data.gate_lat, data.gate_long];

    if (employee_id && cluster) {
        addCommutertoCluster(cluster, employee_id)
            .then(result => {
                console.log('response add Commuter', result);
                if (result == false || result == true) {
                    console.log('Match Routes');
                    matchRoutes(cluster, employee_id, gate, gate_coordinates)
                        .then(result => {
                            console.log('FINAL response', result);
                            if (result.success == true)
                            {
                                res.json({
                                    status: 200,
                                    message: 'success',
                                    data : demo_map[result.driver]
                                });
                            }
                            else
                            {
                                res.json({
                                    status: 301,
                                    message: 'request registered, no cabs available for you',

                                });
                            }
                        })
                        .catch(error => {

                        });
                } else {
                    res.json({
                        status: 301,
                        message: 'Error while adding values to redis'
                    });
                }
            })
            .catch(error => {
                res.json({
                    status: 400,
                    message: 'Bad server error'
                });
            });
    } else {
        res.json({
            status: 300,
            message: 'Incomplete Input'
        });
    }
});

/*Redis Connection---------------------------------`----------- */

var redis = require('redis');
var port = '6379';
var host = '';

client = redis.createClient(port, host);
try {
    client.on('connect', function() {
        console.log("INDEX --- Redis Server Connected");
    });
} catch (err) {
    console.error("Error in Redis connection: ", err);
}

/*Redis Connection---------------------------------`-----------*/

var writeBookingData = function(data) {
    console.log('Mongo Entry x');
    return new Promise(
        function(resolve, reject) {
            console.log('Mongo Write Entry Point');
            var model_path = require('./model/booking.js');
            var booking_model = model_path.booking_model;
            console.log('Booking', booking_model); 
            var booking_document = new booking_model({
                commuter_name: data.commuter_name,
                commuter_id: data.commuter_id,
                driver_name: data.driver_name,
                driver_id: data.driver_id,
                gate: data.gate,
                coordinates: data.coordinates,
                status: true,
                number : data.number
            });
            booking_document.save(function(err, data) {
                if (err) {
                    console.log('Mongo Error', err);
                    resolve(false);
                } else {
                    console.log('Mongo Data', data);
                    resolve(true);
                }
            });
        });
};
var x = function()
{
    console.log ('Called x');
}
var deleteValue = function(cluster, value, user) {
    return new Promise(
        function(resolve, reject) {
            console.log('Delete value hit with', cluster, value, user);
            client.lrem((user + cluster), 0, value,
                function(err, reply) {
                    if (err) {
                        console.error("Error while erasing values from list: " + err, reply);
                        resolve(false);
                    } else {
                        console.log('Value Deleted', value, cluster);
                        resolve(true);
                    }
                });
        }
    )
};

var matchRoutes = function(cluster, employee_id, gate, gate_coordinates) {
    return new Promise(
        function(resolve, reject) {

            client.lrange(('d' + cluster), -999, 99999, function(err, reply) {
                if (err) {
                    console.error("Error while pushing values to list: " + err, reply);
                    return ({
                        status: 300,
                        message: 'Error encountered while adding values to list in redis'
                    });
                } else {
                    console.log('Reply from driver cluster', reply, reply.length);
                    console.log(reply.length > 0)
                    if (reply.length > 0) {
                        var driver_redis_value = reply[0].split("|");
                        if (driver_redis_value[1] > 1) {
                            console.log('Greater Than 1');
                            var token = driver_redis_value[0] + '|' + (driver_redis_value[1] - 1) + '|' + driver_redis_value[2];
                            client.lset(('d' + cluster), 0, token,
                                function(err, reply) {
                                    if (err) {
                                        console.error("Error while pushing values to list: " + err, reply);
                                        resolve({
                                            success: false,
                                            message: 'error while fetching values from redis'
                                        });
                                    } else {
                                        deleteValue(cluster, employee_id, 'c')
                                            .then(result => {
                                                if (result == true) {
                                                    console.log('After Deleting values');
                                                    var mongodata = {
                                                        commuter_name: demo_map[employee_id].name,
                                                        commuter_id: employee_id,
                                                        driver_name: demo_map[driver_redis_value[0]].name,
                                                        driver_id: driver_redis_value[0],
                                                        gate: gate,
                                                        coordinates: gate_coordinates,
                                                        number: demo_map[employee_id].number
                                                    }
                                                    console.log('Mongo Data', mongodata);
                                                    x();
                                                    try {
                                                        writeBookingData(mongodata)
                                                            .then(result => {
                                                                if (result == true) {
                                                                    console.log('Mongo response', result);
                                                                    resolve({
                                                                        success: true,
                                                                        driver: driver_redis_value[0]
                                                                    });
                                                                } else {
                                                                    console.log('False from Mongo');
                                                                }
                                                            })
                                                            .catch(error => {
                                                                console.error('Mongo Write Block exception', error);
                                                            });
                                                    } catch (e) {
                                                        console.log('exception mongo', e);
                                                    }
                                                } else {
                                                    reject({
                                                        success: false,
                                                        message: 'Error in second value in queue where seat is again 0'
                                                    });
                                                }

                                            })
                                            .catch(error => {

                                            });
                                    }
                                });
                        }
                         else if (driver_redis_value[1] == 1) {
                            console.log('Seats left ==  1');
                            deleteValue(cluster, reply[0], 'd')
                                .then(result => {
                                    if (result == true) {
                                        console.log('Calling deleteValue for customer');
                                        deleteValue(cluster, employee_id, 'c')
                                            .then(result => {
                                                if (result == true) {
                                                    var mongodata = {
                                                        commuter_name: demo_map[employee_id].name,
                                                        commuter_id: employee_id,
                                                        driver_name: demo_map[driver_redis_value[0]].name,
                                                        driver_id: driver_redis_value[0],
                                                        gate: gate,
                                                        coordinates: gate_coordinates,
                                                        number : demo_map[employee_id].number
                                                    }
                                                    writeBookingData(mongodata)
                                                        .then(result => {
                                                            if (result == true) {
                                                                resolve({
                                                                    success: true,
                                                                    driver: driver_redis_value[0]
                                                                });
                                                            } else {
                                                                console.log('False from Mongo');
                                                            }
                                                        })
                                                        .catch(error => {

                                                        });
                                                } else {
                                                    reject({
                                                        success: false,
                                                        message: 'Error in second value in queue where seat is again 0'
                                                    });
                                                }

                                            })
                                            .catch(error => {

                                            });
                                    } else {
                                        reject({
                                            success: false,
                                            message: 'Error in second value in queue where seat is again 0'
                                        });
                                    }

                                })
                                .catch(error => {

                                });
                        } else {
                            console.log('THIS SHOULD NOT GET CALLED');
                            deleteValue(cluster, reply[0], 'd')
                                .then(result => {
                                    if (result == true) {
                                        var driver_redis_value = reply[1].split("|");
                                        if (driver_redis_value[1] > 1) {
                                            var token = driver_redis_value[0] + '|' + (driver_redis_value[1] - 1) + '|' + driver_redis_value[2];
                                            client.lset(('d' + cluster), 0, token,
                                                function(err, reply) {
                                                    if (err) {
                                                        console.error("Error while pushing values to list: " + err, reply);
                                                        resolve({
                                                            success: false,
                                                            message: 'error while fetching values from redis'
                                                        });
                                                    } else {
                                                        resolve({
                                                            success: true,
                                                            driver: driver_redis_value[0]
                                                        });
                                                    }
                                                });
                                        }
                                    } else {
                                        reject({
                                            success: false,
                                            message: 'Error in second value in queue where seat is again 0'
                                        });
                                    }

                                })
                                .catch(error => {

                                });
                        }
                    }
                    else
                    {
                        resolve({
                            success: false,
                            message: 'No Driver in the queue for this cluster'
                        });
                    }
                }
            });


        }

    )
};

var checkDuplicate = function(cluster, employee_id, user) {
    return new Promise(
        function(resolve, reject) {
            client.lrange((user + cluster), -999, 99999, function(err, reply) {
                if (err) {
                    console.error("Error while pushing values to list: " + err, reply);
                    reject(false);
                } else {
                    var duplicate = false;
                    console.log('Reply', reply);
                    for (var i = 0; i < reply.length; i++) {
                        var redis_employee_id = reply[i].split("|");
                        redis_employee_id = redis_employee_id[0]
                        console.log('employee_id - redis', redis_employee_id);
                        if (employee_id == redis_employee_id) {
                            duplicate = true;
                            break;
                        }
                    }
                    resolve(duplicate);
                }
            });
        }
    )
};

var addDrivertoCluster = function(cluster, seats, employee_id) {
    return new Promise(
        function(resolve, reject) {

            checkDuplicate(cluster, employee_id, 'd')
                .then(result => {
                    console.log('Result - response - checkDuplicate', result);
                    if (result == false) {
                        var token = employee_id + '|' + seats + '|' + Date.now();
                        client.rpush(('d' + cluster), token, function(err, reply) {
                            if (err) {
                                console.error("Error while pushing values to list: " + err, reply);
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        });
                    } else {
                        console.log('duplicate value');
                        resolve(false);
                    }
                })
                .catch(error => {

                });
        }
    )
};

var addCommutertoCluster = function(cluster, employee_id) {
    return new Promise(
        function(resolve, reject) {
            checkDuplicate(cluster, employee_id, 'c')
                .then(result => {
                    console.log('Result - response - checkDuplicate', result);
                    if (result == false) {
                        client.rpush(('c' + cluster), employee_id, function(err, reply) {
                            if (err) {
                                console.error("Error while pushing values to list: " + err, reply);
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        });
                    } else {
                        console.log('duplicate value');
                        resolve(false);
                    }
                })
                .catch(error => {

                });
        }
    )
};
//
var mongoose = require('mongoose');

var DB_URL = '';

// ??
mongoose.connection.on("connected", function(ref) {
    console.log("Connected to " + " DB!");
});

// If the connection throws an error
mongoose.connection.on("error", function(err) {
    console.error('Faied to connect to DB ' + ' on startup ', err);
    if (err) {
        return next(err);
    }
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function(err) {
    console.log('Mongoose default connection to DB :' + ' disconnected');
    if (err) {
        return next(err);
    }
});

mongoose.connect(DB_URL, function(err) {
    console.log('Connection Done');
    if (err) {
        console.log('error connection to mongo server!');
        console.log(err);
    }
});


//
app.listen(3000, function() {
    console.log("Express server listening on", this.address().port, app.settings.env);
});