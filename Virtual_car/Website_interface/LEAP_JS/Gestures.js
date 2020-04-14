var CircleL_count = 0
var CircleR_count = 0
var SwipeL_count = 0
var SwipeR_count = 0
var upKey = 81
var downKey = 65
//main loop that is continually checking for gestures
var controller = Leap.loop({enableGestures: true}, function(frame){
    //if a gestures is recognized 
    if(frame.valid && frame.gestures.length > 0){
        //Reconizes parent gesture, child gestures will be in each case statement
        frame.gestures.forEach(function(gesture){
          switch (gesture.type){

            case "circle":
                circle = gesture
                circle.pointable = frame.pointable(circle.pointableIds[0]);
                if (circle.state == 'start') {
                        clockwise = true
                        console.log("Circle Start");
                        //prints number of times finger goes in circle
                        // var circleProgress = gesture.progress;
                        // var completeCircles = Math.floor(circleProgress);
                        // console.log("Circle Update: " + completeCircles);
                } else if (circle.state == 'update' & circle.duration > .5) {
                    direction = circle.pointable.direction;
                    //if pointable exists
                    if (direction) {
                        normal = circle.normal;
                        clockwise = Leap.vec3.dot(direction, normal) > 0;
                        if (clockwise) {
                            console.log("Clockwise")
                            CircleL_count +=1
                            if (svg_map.has(upKey) & CircleL_count%6 == 0) 
                            {
                              alterSVG(svg_map, upKey)
                            }
                        } else {
                            console.log("Counter-Clockwise")
                            CircleR_count +=1
                            if (svg_map.has(downKey) & CircleR_count%6 ==0) 
                            {
                              alterSVG(svg_map, downKey)
                            }
                        }
                    }
                } else if (circle.state == 'stop') {
                    console.log("Stop Circle")
                    break;
                }
                break;
        
            case "keyTap":
                console.log("Key Tap Gesture");
                break;

            case "swipe":
                //Classify swipe as either horizontal or vertical
                var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                //Classify as right-left or up-down
                if(isHorizontal & gesture.duration > .4){
                    if(gesture.direction[0] > 0){
                        swipeDirection = "right";
                        if (SwipeR_count%2 == 0 & upKey == 81) {
                            upKey = 87
                            downKey = 83
                        }
                    } else {
                        swipeDirection = "left";
                        if (SwipeL_count%2 == 0 & downKey == 83){
                            upKey = 81
                            downKey= 65
                        }
                    }
                    console.log(swipeDirection)
                } else if(gesture.duration > .5) { //vertical
                    if(gesture.direction[1] > 0){
                        swipeDirection = "up";
                        // SwipeU_count +=1
                        // if (svg_map.has(87) & SwipeU_count%5 == 0) 
                        // {
                        //   alterSVG(svg_map, 87)
                        // }
                    } else {
                        swipeDirection = "down";
                        // SwipeD_count +=1
                        // if (svg_map.has(83) & SwipeD_count%5 == 0) 
                        // {
                        //   alterSVG(svg_map, 83)
                        // }
                    }
                    console.log(swipeDirection)                  
                }

                break;
            }
        });
    }
});

