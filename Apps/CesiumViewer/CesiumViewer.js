define([
        'Cesium/Core/Cartesian3',
        'Cesium/Core/createWorldTerrain', // OMD
        'Cesium/Core/formatError',
        'Cesium/Core/HeadingPitchRoll',
        'Cesium/Core/Math',
        'Cesium/Core/Matrix3', // OMD
        'Cesium/Core/Quaternion', // OMD
        'Cesium/Core/CesiumTerrainProvider', // OMD
        'Cesium/Scene/Camera', // OMD
        'Cesium/Widgets/Viewer/Viewer',
        'Cesium/Widgets/Viewer/viewerDragDropMixin',
        'domReady!'
    ], function(
        Cartesian3,
        createWorldTerrain,
        formatError,
        HeadingPitchRoll,
        CesiumMath,
        Matrix3, // OMD
        Quaternion, // OMD
        CesiumTerrainProvider, // OMD
        Camera, // OMD
        Viewer,
        viewerDragDropMixin) {
    'use strict';

    var loadingIndicator = document.getElementById('loadingIndicator');
    var viewer;
    try {
        viewer = new Viewer('cesiumContainer', {
            baseLayerPicker : false,
            scene3DOnly : true,
            requestRenderMode : false // OMD para que se mueva dinámicamente
        });
    } catch (exception) {
        loadingIndicator.style.display = 'none';
        var message = formatError(exception);
        console.error(message);
        if (!document.querySelector('.cesium-widget-errorPanel')) {
            window.alert(message); //eslint-disable-line no-alert
        }
        return;
    }

    viewer.extend(viewerDragDropMixin);

    viewer.terrainProvider = createWorldTerrain();

    var showLoadError = function(name, error) {
        var title = 'An error occurred while loading the file: ' + name;
        var message = 'An error occurred while loading the file, which may indicate that it is invalid.  A detailed error report is below:';
        viewer.cesiumWidget.showErrorPanel(title, message, error);
    };

    viewer.dropError.addEventListener(function(viewerArg, name, error) {
        showLoadError(name, error);
    });

    var scene = viewer.scene;

    // OMD
    var initialPosition =  new Cartesian3.fromDegrees(-3.72491306, 40.4412152477, 800.0);
    var initialOrientation = new HeadingPitchRoll.fromDegrees(0, 0 ,0);
    var homeCameraView = {
        destination : initialPosition,
        orientation : {
            heading : initialOrientation.heading,
            pitch: initialOrientation.pitch,
            roll : initialOrientation.roll
        }
    };
    viewer.camera.setView(homeCameraView);

    loadingIndicator.style.display = 'none';

    var orientation = new Quaternion();
    var rotation = new Matrix3();
    var camera = scene.camera;
    var savedCamera = Camera.clone(camera);

    var vrDisplay;

    setTimeout(function() {
        window.vrDisplay = scene.vrDisplay;
    }, 1000)

    viewer.clock.onTick.addEventListener(function(clock){
        if(viewer.scene.useWebVR && scene.vrDisplay){
            var frameData = new VRFrameData();
            window.vrDisplay.getFrameData(frameData);

            var pose = frameData.pose;

            orientation = Quaternion.unpack(pose.orientation, 0);

            var pitch = orientation.x;
            var yaw = orientation.y;
            var roll = orientation.z;

            orientation.x = 0.8*yaw + 0.2*roll;
            orientation.y = pitch;
            orientation.z = 0.6*yaw - 0.4*roll;

            rotation = Matrix3.fromQuaternion(orientation);
            Matrix3.multiplyByVector(rotation, savedCamera.direction, camera.direction);
            Matrix3.multiplyByVector(rotation, savedCamera.up, camera.up);
            Cartesian3.cross(camera.direction, camera.up, camera.right);

            Cartesian3.normalize(camera.direction, camera.direction);
            Cartesian3.normalize(camera.up, camera.up);
            Cartesian3.normalize(camera.right, camera.right);
        }
    });


    // EJEMPLO DE COMO CESIUM SE ADAPTARÍA A LA RECEPCIÓN DE TELEMETRÍA DEL UAV
    var aa;
    /*
    var uav_heading;
    var uav_pitch;
    var uav_roll;
    var uav_heading_i;
    var uav_pitch_i;
    var uav_roll_i;
    var lambda_heading;
    var lambda_pitch;
    var lambda_roll;
    */

    aa = initialPosition;

    setInterval(function(){
        window.aa = new Cartesian3.fromDegrees(CesiumMath.randomBetween(-3.8,-3.79), CesiumMath.randomBetween(40.49, 40.5), CesiumMath.randomBetween(700,710));
    }, 500)

    setInterval(function(camera){
        if (camera.position != window.aa){
            camera.flyTo({
                destination : window.aa,
                duration : 0.15,
                orientation: {
                    heading : camera.heading,
                    pitch : camera.pitch,
                    roll : camera.roll
                }
            })

            //uav_heading_i = uav_heading;
            //uav_pitch_i = uav_pitch;
            //uav_roll_i = uav_roll;

        }

        window.aa = camera.position;
    }, 107, camera)
});
