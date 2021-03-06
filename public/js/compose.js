;(function() {
  var lastSavedURL;

  //cache a bunch of selectors
  var $composeView = $('.compose-view');
  var $shareView = $('.share-view');
  var $shareLink = $('.share-link');
  var $twitterLink = $('.tweet-btn');
  var $facebookLink = $('.fb-post-btn');
  var $headerImages = $('.header .images');
  var $recipientsField = $('.share-form .recipients');
  var $nameField = $('.share-form .name');
  var $composeView = $('.compose-view');
  var $shareView = $('.share-view');
  var $shareLink = $('.share-link');
  var $composeFrom = $('.compose-view .from');
  var $composeMessage = $('.compose-view .message');
  var $body = $('body');
  var expressionKeys = Object.keys(graphTemplates);

  //move on to step 2 (share)
  var showShare = function () {
    $composeView.hide();
    $shareView.show();
    $body.removeClass('is-loading');
  };

  //go back to step 1 (compose)
  var showCompose = function () {
    $shareView.hide();
    $composeView.show();
    desmosGraph.resize();
  };

  //this is called once we have a short url from the google url-shortener
  var shareCallback = function(resp){
    $shareLink.val(resp.id);
    var tweetUrl = "https://twitter.com/intent/tweet?text="
                 + encodeURIComponent("For my math lovers: a Desmos Math-o-gram! " + resp.id)
                 + "&via=desmos";
    var fbUrl = 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(resp.id);
    $twitterLink.attr('href', tweetUrl);
    $facebookLink.attr('href', fbUrl);
    lastSavedURL = resp.id;
    showShare();
  };

  //this initiates a request to google to shorten the url
  var share = function(){
    $body.addClass('is-loading');

    //construct the longUrl
    var currentStateJSON = encodeURIComponent(JSON.stringify(desmosGraph.getState()));
    var urlBase =  window.location.origin + '/view';
    var message = encodeURIComponent($composeMessage.val());
    var from = encodeURIComponent($composeFrom.val());
    var longUrl = urlBase.concat('?state=',currentStateJSON,'&message=',message,'&from=',from);

    //use the google api to shorten, and call googleCallback
    var r = gapi.client.urlshortener.url.insert({'resource':{'longUrl': longUrl}})
    r.execute(shareCallback);
  };

  //**
  // handle logic for sending an e-mail.
  // posts to /send, and uses mandrill to actually send the email
  //**
  var sendEmail = function () {
    $body.addClass('is-loading');
    return $.post('/send', {
      recipients: $recipientsField.val(),
      name: $nameField.val(),
      link: lastSavedURL
    }).done(function () {
      $body.removeClass('is-loading');
      $('.success-message').show();
      $recipientsField.val('');
      setTimeout(function() {
        $('.success-message').fadeOut();
      }, 2000)
    }).fail(function () {
      $body.removeClass('is-loading');
      $('.error-message').show();
      setTimeout(function() {
        $('.error-message').fadeOut();
      }, 2000)
    })
  };

  //this is the code that interacts with the graphpaper
  var clickToSetGraph = function() {
    $('.button.selected').removeClass('selected');
    $(this).addClass('selected');
    selectGraph($(this).attr('name'));
  };

  var selectGraph = function(name){
    desmosGraph.setState(graphTemplates[name]);
  };

  //Finally: let's execute some code!
  //First, instantiate a Desmos Graph
  var graphPaper = $('.graph-paper')[0];
  var desmosGraph = Desmos.Calculator(graphPaper, {menus: true});

  //Hook up our listeners
  $('.action-share').on('click', share);
  $('.action-create-another').on('click', showCompose)
  $composeMessage.on('click', function() {this.select();});
  $composeFrom.on('click', function() {this.select();});
  $shareLink.on('click', function() {this.select();});
  $('.button').on('click', clickToSetGraph);
  $('.action-send').on('click', sendEmail);

  //set the state of the graph
  selectGraph('heart');
  $body.removeClass('is-loading');
})()
