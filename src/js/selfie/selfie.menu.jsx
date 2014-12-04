/** @jsx React.DOM */
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || null;

var WebRTC = window.navigator && navigator.getUserMedia;
var navigatorCamera = navigator.camera && navigator.camera.getPicture;

function dataURItoBlob (dataURI) {
  dataURI = dataURI.substr('data:image/jpeg;base64,'.length);

  var byteString = window.atob(dataURI);

  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  var blob = new Blob([ia], { type: 'image/jpeg' });

  return blob;
}

var MenuInitial = React.createClass({
  mixins: [ReactIntlMixin],
	getInitialState: function () {
		return {stream: null};
	},

	onError: function (err) {
		console.log(err);
		this.props.makeAlert(this.getIntlMessage('errors.camera'));
	},

	getUserMedia: function () {

      navigator.getUserMedia({video: true}, function(stream) {
    	this.setState({stream: stream}, function () {
    		this.props.setCameraStream(window.URL.createObjectURL(stream), stream);
    	}.bind(this));

      }.bind(this), this.onError);

	},

	callNativeCamera: function () {

		navigator.camera.getPicture(

			function (result) {
				this.props.setImage('selfie', result);
			}.bind(this), 

			this.onError, 

			{destinationType: Camera.DestinationType.FILE_URI}
	  	);

	},

	callNativeGallery: function () {

		navigator.camera.getPicture(

			function (result) {
				this.props.setImage('selfie', result);
			}.bind(this), 

			this.onError, 

			{destinationType: Camera.DestinationType.FILE_URI, sourceType: Camera.PictureSourceType.PHOTOLIBRARY}
	  	);

	},

	openCamera: function () {
		if (WebRTC) {
			this.getUserMedia();
		} else if (navigatorCamera) {
			this.callNativeCamera();
		}
	},

	fileInputLoad: function (event) {

	    var fileInput = event.currentTarget,
	      file = fileInput.files[0],
	      reader, imageType = /image.*/,
        size = file.size/1024/1024;

	    if (!file) return this.props.makeAlert(this.getIntlMessage('errors.file'));
      if (size > 4) return this.props.makeAlert(
        this.formatMessage(
          this.getIntlMessage('errors.size'),
          {size: Math.floor(size * 100)/100, max: 4}
        )
      );
	    if (!file.type.match(/image.(?:jpg|jpeg|gif|png)/)) return this.props.makeAlert(
        this.formatMessage(
          this.getIntlMessage('errors.format'),
          {types: 'jpg, png e gif'}
        )
      );


	    reader = new FileReader();
	    reader.onload = function (e) {
	      this.props.setImage('selfie', reader.result);
	    }.bind(this);

	    reader.readAsDataURL(file);
	},
	
	capture: function () {
		this.props.captureCamera(this.state.stream);
	},

	render: function () {
		var supportsCamera = navigatorCamera || WebRTC;
    var messageSuffix = this.props.orientation === 'portrait' ? '_mob' : '';
    var TakePicButton = this.props.hasOpenStream
					? <a id='SelfieTakePic' className='sBt lameHover' disabled={!this.props.canCapture} onClick={this.capture}>
              {this.getIntlMessage('menu.capture_pic'  + messageSuffix)}</a>
					: <a id='SelfieTakePic' className='sBt lameHover' onClick={this.openCamera}>
              {this.getIntlMessage('menu.new_pic'  + messageSuffix)}</a>;

    var toggleBtClasses = React.addons.classSet({
      lameHover: true,
      sBt: true,
      hasStupidAnimation: this.props.highlight
    });



		return (
			<div  className='fullWrapper' id='MenuBtsContainer'>
			{this.props.togglePopup
				&& <a  className={toggleBtClasses} id='ShowPopupButton' onClick={this.props.togglePopup}>{'#'}</a>}

			<div id='SelfieOpenGallery' className='sBt lameHover' onClick={navigatorCamera ? this.callNativeGallery : null}>
        {this.getIntlMessage('menu.choose_pic' + messageSuffix)}
				{ !navigatorCamera 
					? <input id='SelfieFileSelector' type='file' onChange={this.fileInputLoad} />
					: null
				}
			</div>

      { supportsCamera && TakePicButton }
			</div>
    );
	}
});



var MenuCheck = React.createClass({
  mixins: [ReactIntlMixin],
	render: function () {

    var toggleBtClasses = React.addons.classSet({
      sBt: true,
      lameHover: true,
      hasStupidAnimation: this.props.highlight
    });

    var messageSuffix = this.props.orientation === 'portrait' ? '_mob' : '';

		return (
			<div className='fullWrapper' id='MenuBtsContainer'>
				{this.props.togglePopup
					&& <a className={toggleBtClasses} id='ShowPopupButton' onClick={this.props.togglePopup}>{'#'}</a>}

        <a id='BtChangeSelfie' onClick={this.props.selfieSelector} className='sBt lameHover'>
          {this.getIntlMessage('menu.change_pic' + messageSuffix)}</a>

				<a id='BtProceedToSave' disabled={!this.props.allSet} onClick={this.props.goToSaveMenu}
          className={React.addons.classSet({lameHover: this.props.allSet, sBt: true})}>
            {this.getIntlMessage('menu.confirm_pic' + messageSuffix)}</a>

      </div>
    );
	}
});

var MenuSave = React.createClass({
  mixins: [ReactIntlMixin],
	getInitialState: function () {
		return {
			saved: false,
      fbStatus: typeof FB !== 'undefined' ? 'initial' : 'waiting'
		};
	},

  componentDidMount: function () {
    if (typeof FB === 'undefined') this._loadFB();
  },

  _loadFB: function () {

    this.setState({fbStatus: 'waiting'}, function () {
      window.fbAsyncInit = this._initFB;

      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        //js.src = '//connect.facebook.net/en_US/sdk/debug.js';
        js.src = "http://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }.bind(this));

  },

  _initFB: function () {


    FB.init({
      appId: '289736691228425',
      xfbml: true,
      version: 'v2.1'
    });

    this.setState({fbStatus: 'initial'});

  },

  _FBError: function () {
    this.setState({fbStatus: 'error'}, function () {
      this.props.makeAlert(this.getIntlMessage('errors.upload_fb'));
    });
  },

  _uploadFB: function () {
    this.setState({fbStatus: 'loading'}, function () {
      var formData = new FormData();
      var token = FB.getAuthResponse()['accessToken'];

      formData.append("access_token", token);
      formData.append("source", dataURItoBlob(this.props.canvasDataURL));
      //formData.append("message", "");


      $.ajax({
        url: "https://graph.facebook.com/me/photos?access_token=" + token,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        success: function (data) {
          this.setState({fbStatus: 'saved'});
        }.bind(this),
        error: this._FBError
      });
    });

    /*

    FB.api(
      "/me/photos", "POST",
      formData,
      function (response) {

        if (response && response.error) return callback(response.error);
        callback(null, response);

      }
    );
    */
  },

  _loginFB: function () {
    FB.login(
      function(response) {

        if (!(response && response.authResponse)) return this._FBError();

        this._uploadFB();

      }.bind(this),
      {scope: 'publish_actions', return_scopes: true}
    );

    /*

      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') return this._uploadFB();



      }.bind(this));

    */
    this.setState({fbStatus: 'waiting'});
  },

	saveMe: function () {
		this.setState({saved: true});
	},

	writeToDisk: function () {
    var blob = dataURItoBlob(this.props.canvasDataURL);
    function gotFS(fileSystem) {
      fileSystem.root.getFile("rio2016selfie.jpeg", {create: true, exclusive: false}, gotFileEntry.bind(this), fail.bind(this));
    }

    function gotFileEntry(fileEntry) {
      fileEntry.createWriter(gotFileWriter.bind(this), fail.bind(this));
    }

    function gotFileWriter(writer) {
      writer.write(blob);

      if ('android') {
        /*
          android.intent.action.MEDIA_SCANNER_SCAN_FILE
         */

      }
    }

    function fail(error) {
      this.props.makeAlert(this.getIntlMessage('errors.write_to_disk'));
    }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS.bind(this), fail.bind(this));

		this.setState({saved: true});
	},

	twitterShare: function () {
    var url = 'http://twitter.com/intent/tweet?url=' + window.location.href;
    if (window.fromCordova) {
      window.open(url, '_system');
    } else {
      window.open(url);
    }
	},

  unsaved: function () {
    this.setState({fbStatus: 'initial'});
  },

  toggleSharePopup: function () {
    this.setState({visibleSharePopup: !!!this.state.visibleSharePopup});
  },

	render: function () {

    var fbBt;

    switch (this.state.fbStatus) {
      case 'initial':
        fbBt = <a id='BtShareFB' onClick={this._loginFB} className='sBt lameHover'>&nbsp;</a>;
        break;
      case 'waiting':
        fbBt = <a className='sBt waiting'><span>{'...'}</span></a>;
        break;
      case 'loading':
        fbBt = <a className='sBt loading'><span>{'↻'}</span></a>;
        break;
      case 'saved':
        fbBt = <a className='sBt saved'><span>{'✔'}</span></a>;
        break;
      case 'error':
        fbBt = <a onClick={this.unsaved}className='sBt lameHover error'><span>{'!'}</span></a>;
        break;
    }

    var messageSuffix = this.props.orientation === 'portrait' ? '_mob' : '';

    if (this.props.orientation === 'landscape') {
      return (
        <div className='fullWrapper'  id='MenuBtsContainer'>
            <a id='BtShareTwitter' className='sBt lameHover' onClick={this.twitterShare}>&nbsp;</a>
            {fbBt}
            {!window.fromCordova
              ?
                (this.props.orientation === 'portrait'
                  ? <a id='BtDownload' href={this.props.canvasDataURL} className='sBt lameHover' target='_blank'>
                          {this.getIntlMessage('menu.save_pic')}
                    </a>
                  : <a id='BtDownload' href={this.props.canvasDataURL} className='sBt lameHover' download='Rio2016Selfie.jpg'>
                        {this.getIntlMessage('menu.save_pic')}
                    </a>
                )

              :
                <a id='BtDownload' className={React.addons.classSet({sBt: true, lameHover: !this.state.saved})}
                      onClick={this.writeToDisk}>
                  {this.getIntlMessage('menu.save_pic')}
                </a>
            }

            <a id='BtGoBack' className='sBt lameHover' onClick={this.props.exitSave}>
              {this.getIntlMessage('menu.try_again')}
            </a>
        </div>
      );
    }

    var sharePopupClasses = React.addons.classSet({
      visible: this.state.visibleSharePopup
    });

    return (
      <div className='fullWrapper'  id='MenuBtsContainer'>

        <a id='BtSharePopup' className='sBt lameHover' onClick={this.toggleSharePopup}>
          {this.getIntlMessage('menu.share')}
        </a>

        <div id='SelfieSharePopup' className={sharePopupClasses}>
          <a id='BtShareTwitter' className='sBt lameHover' onClick={this.twitterShare}>&nbsp;</a>
          {fbBt}
        </div>

        {!window.fromCordova
          ?
          <a id='BtDownload' href={this.props.canvasDataURL} className='sBt lameHover' download='Rio2016Selfie.jpg'>
            <span>{this.getIntlMessage('menu.save_pic')}</span>
          </a>

          :
          <a id='BtDownload' className={React.addons.classSet({sBt: true, lameHover: !this.state.saved})}
            onClick={this.writeToDisk}>
              {this.getIntlMessage('menu.save_pic')}
          </a>
        }

        <a id='BtGoBack' className='sBt lameHover' onClick={this.props.exitSave}>
          {this.getIntlMessage('menu.try_again' + messageSuffix)}
        </a>

      </div>
    );
	}
});

module.exports = {
	initial: MenuInitial,
	check: MenuCheck,
	save: MenuSave
};