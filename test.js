var twist;
var cmdVel;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
var ros;

function moveAction(linear, angular) {
    if (linear !== undefined && angular !== undefined) {
        twist.linear.x = linear;
        twist.angular.z = angular;
    } else {
        twist.linear.x = 0;
        twist.angular.z = 0;
    }
    cmdVel.publish(twist);
}

function initVelocityPublisher() {
    // Init message with zero values.
    twist = new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    // Init topic object
    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/turtle1/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
    // Register publisher within ROS system
    cmdVel.advertise();

}

function createJoystick() {
    // Check if joystick was aready created
    if (manager == null) {
        joystickContainer = document.getElementById('joystick');
        // joystck configuration, if you want to adjust joystick, refer to:
        // https://yoannmoinet.github.io/nipplejs/
        var options = {
            zone: joystickContainer,
            position: { left: 50 + '%', top: 105 + 'px' },
            mode: 'static',
            size: 200,
            color: '#0066ff',
            restJoystick: true
        };
        /*
        var pose = new ROSLIB.Topic({
            ros: ros,
            name: '/turtle1/pose',
            messageType: 'turtlesim/Pose'
        });
        pose.subscribe(function(m) {
                //rounding pose values to 3 decimals
                var x = Math.round(m.x*1000)/1000;
                var y = Math.round(m.y*1000)/1000;
                //theta needs to get formatted to degrees, and rounded to 2 decimals
                var th = Math.round(m.theta*180/3.142*100)/100;

                document.getElementById("turtx").innerHTML = "X: "+ x.toString();
                document.getElementById("turty").innerHTML = "Y: "+y.toString();
                document.getElementById("turttheta").innerHTML = "Heading: "+th.toString()+" Degrees";
                
        });
        */
        manager = nipplejs.create(options);
        // event listener for joystick move
        manager.on('move', function (evt, nipple) {
            // nipplejs returns direction is screen coordiantes
            // we need to rotate it, that dragging towards screen top will move robot forward
            var direction = nipple.angle.degree - 90;
            if (direction > 180) {
                direction = -(450 - nipple.angle.degree);
            }
            // convert angles to radians and scale linear and angular speed
            // adjust if youwant robot to drvie faster or slower
            var maxlin = 3.0;
            var maxang = 2.0;
            var lin = Math.cos(direction / 57.29) * maxlin * nipple.distance/100;
            var ang = Math.sin(direction / 57.29) * maxang * nipple.distance/100;
            // nipplejs is triggering events when joystic moves each pixel
            // we need delay between consecutive messege publications to 
            // prevent system from being flooded by messages
            // events triggered earlier than 50ms after last publication will be dropped 
            if (publishImmidiately) {
                publishImmidiately = false;
                moveAction(lin, ang);
                setTimeout(function () {
                    publishImmidiately = true;
                }, 50);
            }
            
        });
        // event litener for joystick release, always send stop message
        manager.on('end', function () {
            moveAction(0, 0);
        });
    }
}

window.onload = function () {
    //determine robot address automatically
    //robot_IP = location.hostname;
    // set robot address statically
    robot_IP = "localhost";

    // // Init handle for rosbridge_websocket
    ros = new ROSLIB.Ros({
        url: "ws://" + robot_IP + ":9090"
    });
    ros.on('connection', function() {
    document.getElementById("status").innerHTML = "Connected";
    });

    ros.on('error', function(error) {
    document.getElementById("status").innerHTML = "Error";
    });

    ros.on('close', function() {
    document.getElementById("status").innerHTML = "Closed";
    });

    initVelocityPublisher();
    createJoystick();
    //};
}