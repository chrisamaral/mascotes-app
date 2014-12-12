/** @jsx React.DOM */
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || null;
var supportsADownload = !window.externalHost && 'download' in document.createElement('a');
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

    navigator.getUserMedia({video: true},

      function(stream) {
        this.setState({stream: stream},

          function () {
            this.props.setCameraStream(window.URL.createObjectURL(stream), stream);
          }.bind(this)

        );
      }.bind(this),

      this.onError
    );

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

    var state = {
      saved: false,
      hasInstagram: false,
      facebookStatus: 'ready',
      instagramStatus: 'ready',
      twitterStatus: 'ready'
    };

    if (!window.fromCordova) {
      state.facebookStatus = typeof FB !== 'undefined' ? 'ready' : 'waiting';
    }

		return state;
	},

  componentDidMount: function () {
    if (typeof FB === 'undefined' && !window.fromCordova) {
      this._loadFB();
    }

    if (!window.fromCordova || !window.Instagram) {
      return;
    }

    Instagram.isInstalled(function (err, installed) {
      if (installed) {
        this.setState({hasInstagram: true});
      }
    }.bind(this));
  },

  _loadFB: function () {

    this.setState({facebookStatus: 'waiting'}, function () {
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

    this.setState({facebookStatus: 'ready'});

  },

  _shareError: function (appName) {
    var appAbbr = appName.toLowerCase();
    this.state[appAbbr + 'Status'] = 'error';

    this.setState(this.state, function () {
      this.props.makeAlert(this.formatMessage(this.getIntlMessage('errors.share_on'),
          {app_name: appName})
      );
    });
  },

  _facebookError: function () {
    this._shareError('Facebook');
  },

  _twitterError: function () {
    this._shareError('Twitter');
  },

  _instagramError: function () {
    this._shareError('Instagram');
  },

  _uploadFB: function () {
    this.setState({facebookStatus: 'loading'}, function () {
      var formData = new FormData();
      var token = FB.getAuthResponse()['accessToken'];

      formData.append("access_token", token);
      formData.append("source", dataURItoBlob(this.props.canvasDataURL));

      $.ajax({
        url: "https://graph.facebook.com/me/photos?access_token=" + token,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        success: function (data) {
          this.setState({facebookStatus: 'saved'});
        }.bind(this),
        error: this._facebookError
      });
    });
  },

  _loginFB: function () {
    FB.login(
      function(response) {

        if (!(response && response.authResponse)) return this._facebookError();

        this._uploadFB();

      }.bind(this),
      {scope: 'publish_actions', return_scopes: true}
    );

    this.setState({facebookStatus: 'waiting'});
  },

	saveMe: function () {
		this.setState({saved: true});
	},

	writeToDisk: function () {
    var fileName = "Rio2016Selfie-" + Math.random().toString(36).substr(2) + ".jpeg";
    var blob = dataURItoBlob(this.props.canvasDataURL);

    function gotFS(fileSystem) {
      this.setState({FS: fileSystem});
      fileSystem.root.getFile(fileName, {create: true, exclusive: false}, gotFileEntry.bind(this), fail.bind(this));
    }

    function gotFileEntry(fileEntry) {
      var state = this.state;
      if (!state.savedFiles) {
        state.savedFiles = [];
      }

      state.savedFiles.push(fileEntry);
      this.setState(state);
      fileEntry.createWriter(gotFileWriter.bind(this), fail.bind(this));
    }

    function gotFileWriter(writer) {
      writer.write(blob);

      if (device.platform === 'Android') {
        //refreshMedia.refresh(fileName);
      }
    }

    function fail(error) {
      this.props.makeAlert(this.getIntlMessage('errors.write_to_disk'));
    }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS.bind(this), fail.bind(this));

		this.setState({saved: true});
	},

  saveSelfie: function (e) {

    if (window.fromCordova) {
      e.preventDefault();
      this.writeToDisk();
    } else {
      this.setState({saved: true});
    }

  },

  
  openTwitterApp: function () {
    var fileEntry = this.state.savedFiles[this.state.savedFiles.length - 1];
    window.plugins.socialsharing.shareViaTwitter(
      this.getIntlMessage('share_text.twitter'),
      fileEntry.nativeURL,//file path
      null, //url
      null,//successCallback
      this._twitterError
    );
  },

  openFacebookApp: function () {
    var fileEntry = this.state.savedFiles[this.state.savedFiles.length - 1];
    window.plugins.socialsharing.shareViaFacebook(
      '',
      fileEntry.nativeURL,//file path
      null, //url
      null,//successCallback
      this._facebookError
    );
  },

  shareOnInstagram: function () {
    this.setState({postedOnInstagram: true});
    setTimeout(this.forgetSocialSaveStatus, 1000 * 2);

    Instagram.share(this.props.canvasDataURL, function (err) {
      if (err && err.toLowerCase() !== 'share cancelled') {
        this._instagramError();
      }
    }.bind(this));
  },

	shareOnTwitter: function () {
    this.setState({postedOnTwitter: true});
    setTimeout(this.forgetSocialSaveStatus, 1000 * 2);

    if (window.fromCordova) {
      return this.openTwitterApp();
    }

    var url = 'http://twitter.com/intent/tweet?url=' + window.location.href;
    window.open(url);
	},
  
  forgetSocialSaveStatus: function () {
    this.setState({postedOnFacebook: false, postedOnTwitter: false, postedOnInstagram: false});
  },

  shareOnFacebook: function () {
    if (!window.fromCordova) {
      this._loginFB();
    } else {
      this.openFacebookApp();
    }
    this.setState({postedOnFacebook: true});
    setTimeout(this.forgetSocialSaveStatus, 1000 * 2);
  },

  forgetShareError: function (e) {
    e.preventDefault();
    this.state[$(e.target).data('target') + 'Status'] = 'ready';
    this.setState(this.state);
  },

  toggleSharePopup: function () {
    this.setState({visibleSharePopup: !!!this.state.visibleSharePopup});
  },

	render: function () {
    var messageSuffix = this.props.orientation === 'portrait' ? '_mob' : '';
    var socialSharingDisabled = window.fromCordova && !this.state.saved;
    var downloadButtonClasses = React.addons.classSet({sBt: true, lameHover: !this.state.saved});

    var shareOnTwitterButton;
    switch (this.state.twitterStatus) {
      case 'error':
        shareOnTwitterButton = <a onClick={this.forgetShareError} data-target='twitter' className='sBt lameHover error'><span>{'!'}</span></a>;
        break;
      default:
        shareOnTwitterButton = <button id='BtShareTwitter' className='sBt lameHover' onClick={this.shareOnTwitter} disabled={socialSharingDisabled || !!this.state.postedOnTwitter}>&nbsp;</button>;
        break;
    }

    var goBackButton = <a id='BtGoBack' className='sBt lameHover' onClick={this.props.exitSave}>{this.getIntlMessage('menu.try_again' + messageSuffix)}</a>;

    var instagramShareButton = null;

    if (this.state.hasInstagram) {
      switch (this.state.instagramStatus) {
        case 'error':
          instagramShareButton = <a onClick={this.forgetShareError} data-target='instagram' className='sBt lameHover error'>
            <span>{'!'}</span>
          </a>;
          break;
        default:
          instagramShareButton = <button id='BtShareInstagram' className='sBt lameHover' onClick={this.shareOnInstagram} disabled={socialSharingDisabled || !!this.state.postedOnInstagram}>&nbsp;</button>;
          break;
      }
    }

    var shareOnFacebookButton;

    switch (this.state.facebookStatus) {
      case 'ready':
        shareOnFacebookButton = <button id='BtShareFB' onClick={this.shareOnFacebook} className='sBt lameHover' disabled={socialSharingDisabled || !!this.state.postedOnFacebook}>&nbsp;</button>;
        break;
      case 'waiting':
        shareOnFacebookButton = <a className='sBt waiting'><span>{'...'}</span></a>;
        break;
      case 'loading':
        shareOnFacebookButton = <a className='sBt loading'><span>{'↻'}</span></a>;
        break;
      case 'saved':
        shareOnFacebookButton = <a className='sBt saved'><span>{'✔'}</span></a>;
        break;
      case 'error':
        shareOnFacebookButton = <a onClick={this.forgetShareError} data-target='facebook' className='sBt lameHover error'><span>{'!'}</span></a>;
        break;
    }

    var downloadButton;

    if (window.fromCordova) {
      downloadButton = <a id='BtDownload' className={downloadButtonClasses} onClick={this.saveSelfie}>
        {this.getIntlMessage('menu.save_pic')}
      </a>;
    } else if (supportsADownload) {
      downloadButton = <a id='BtDownload' href={this.props.canvasDataURL} className={downloadButtonClasses} download='Rio2016Selfie.jpg' onClick={this.saveSelfie}>
        {this.getIntlMessage('menu.save_pic')}
      </a>;
    } else {
      downloadButton = <a id='BtDownload' href={this.props.canvasDataURL} className={downloadButtonClasses} target='_blank' onClick={this.saveSelfie}>
        {this.getIntlMessage('menu.save_pic')}
      </a>;
    }

    if (this.props.orientation === 'landscape') {
      return (
        <div className='fullWrapper'  id='MenuBtsContainer'>
            {shareOnTwitterButton}
            {shareOnFacebookButton}
            {instagramShareButton}
            {downloadButton}
            {goBackButton}
        </div>
      );
    }

    var sharePopupClasses = React.addons.classSet({
      visible: this.state.visibleSharePopup
    });

    return (
      <div className='fullWrapper' id='MenuBtsContainer'>

        <button id='BtSharePopup' className='sBt lameHover' onClick={this.toggleSharePopup} disabled={socialSharingDisabled}>
          {this.getIntlMessage('menu.share')}
        </button>

        <div id='SelfieSharePopup' className={sharePopupClasses}>
          {shareOnFacebookButton}
          {shareOnTwitterButton}
          {instagramShareButton}
        </div>

        {downloadButton}
        {goBackButton}
      </div>
    );
	}
});

module.exports = {
	initial: MenuInitial,
	check: MenuCheck,
	save: MenuSave
};