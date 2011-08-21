/*
   HTML5STICKY (http://github.com/sarfraznawaz2005/HTML5Sticky)
   ================================================================
   Author   : Sarfraz Ahmed (sarfraznawaz2005@gmail.com)
   Twitter  : @sarfraznawaz
   Blog     : http://sarfraznawaz.wordpress.com/
   LICENSE  : MIT
   ================================================================
*/

var stickywidth = 200;  // width of sticky note (can't be less than 200)
var stickyheight = 200; // height of sticky note (can't be less than 200)
var max_notes = 500; // maximum number of notes one can store
var allowed_tags = '<br /><br><ol></ol><ul></ul><li></li><strong></strong><i></i>';

var html5sticky = {};
var note_index = 0;

// add a note
html5sticky.addNote = function(){

    // count total present notes
    var tnotes = $('.note_common').length;

    if (tnotes === max_notes){
       html5sticky.showMessage('#FFE16B', 'black', 'You can not add any more notes, please delete some to add more.');
       return false;
    }

    // unique localstorage identifier for this sticky note
    var nindex = ++note_index + 'stickynote';

    var dated = html5sticky.getDateTime();
    var dateStr = new Date();
   
    // get random color
    var bgcolor = html5sticky.getColor();

    var stickynote = $('<div class="note_common ' + bgcolor + '" />').appendTo($('#main'));
    // add tape to stickynote
    html5sticky.addPin(stickynote);

    $(stickynote).append($('<h2>' + dated + '</h2>'));
    $(stickynote).append($('<p>Text here...</p>'));
    // append identifier
    $(stickynote).append($('<span id="idf_' + nindex + '" />'));

    // set width and height of the sticky note
    $('.note_common').css({width: stickywidth + 'px', height:stickyheight + 'px'});

    $('.note_common p').css({height:(stickyheight - 60) + 'px', width:(stickywidth + 9) + 'px'});

    if (! $("#removenotes").is(':visible')){
       $('#removenotes').slideDown('slow');
    }

    //$(stickynote).find('h2').attr('contentEditable', true);
    //$(stickynote).find('p').attr('contentEditable', true);

    // add utility buttons
    //html5sticky.addUtilityButtons(stickynote);

    // scroll to newly added sticky note
    $('html, body').animate({
      scrollTop:$(stickynote).offset().top
    });
    
    // store note info local storage
    if (Modernizr.localstorage){
       localStorage.setItem(nindex, nindex);
       localStorage.setItem(nindex + '|pos', parseInt($(stickynote).offset().left, 10) + '|' + parseInt($(stickynote).offset().top, 10));
       localStorage.setItem(nindex + '|text', $(stickynote).find('h2').text() + '|' + $(stickynote).find('p').text());
       localStorage.setItem(nindex + '|bgcolor', bgcolor);
       localStorage.setItem(nindex + '|dated', dated + '|' + html5sticky.getISODateTime(dateStr));
    }
    else {
       html5sticky.nohtml5();
    }
};

// no html5 ?
html5sticky.nohtml5 = function(){
   html5sticky.showMessage('#FFE16B', 'black', 'Your browser does not support html5, please upgrade your browser.');
};


// adds utility buttons on note footer
html5sticky.addUtilityButtons = function(el){
   $el = $(el);

   $el.append('<div align="center" class="icons-footer" />');

   $('.icons-footer').append('<img class="left shrink ficon" src="assets/img/shrink.png" alt="" title="shrink/expand">');
   $('.icons-footer').append('<img class="left alarm ficon" src="assets/img/alarm.png" alt="" title="set alarm for this sticky note">');
   $('.icons-footer').append('<img class="left lock ficon" src="assets/img/lock.png" alt="" title="lock this sticky note">');
   $('.icons-footer').append('<img class="left settings ficon" src="assets/img/settings.png" alt="" title="settings for note">');
   $('.icons-footer').append('<img class="left email ficon" src="assets/img/email.png" alt="" title="email this sticky note">');
   $('.icons-footer').append('<img class="left tweet ficon" src="assets/img/tweet.png" alt="" title="tweet this sticky note">');
   $('.icons-footer').append('<img class="left share ficon" src="assets/img/share.png" alt="" title="share this sticky note">');

   // set "left" for these icons now
   $('.ficon:first').css({marginLeft: '10px', marginRight: '15px'});
   $('.ficon').each(function(index){
      $(this).css('left', index * (parseInt($(this).width(), 10) + 5));
   });

};


// save note
html5sticky.saveNote = function(el){
   if (Modernizr.localstorage){
      var identifier = html5sticky.getIdentifier($(el));
      var htext = html5sticky.stripTags($(el).closest('.bignote').find('.hedit')[0].value, allowed_tags);
      var ptext = html5sticky.stripTags($(el).closest('.bignote').find('.pedit')[0].value, allowed_tags);
      ptext = ptext.replace(/\r?\n/g, '<br />');
      
      localStorage.setItem(identifier + '|text', htext + '|' + ptext);

      $('[id^=idf_' + identifier + ']').closest('.note_common').find('h2').text(htext);
      $('[id^=idf_' + identifier + ']').closest('.note_common').find('p').html(ptext);

      html5sticky.showMessage('#9BED87', 'black', 'Sticky Note Saved :)');

   }
   else {
      html5sticky.nohtml5();
   }
};

// get note identifier
html5sticky.getIdentifier = function(el){
   var identifier = $(el).closest('.bignote').find('[id^=idf_]').attr('id');

   if (typeof identifier == 'undefined' || identifier == null){
      identifier = $(el).closest('.note_common').find('[id^=idf_]').attr('id');
   }

   if (typeof identifier != 'undefined'){
      identifier = identifier.replace('idf_', '');
      return identifier;
   }
   else{
      return false;
   }
};


// delete note
html5sticky.deleteNote = function(el){
    if (confirm('Are you sure you want to delete this sticky note ?')){

         // delete from storage also
         if (Modernizr.localstorage){
            var identifier = html5sticky.getIdentifier($(el));

            localStorage.removeItem(identifier);
            localStorage.removeItem(identifier + '|pos');
            localStorage.removeItem(identifier + '|text');
            localStorage.removeItem(identifier + '|settings');
         }
         else {
            html5sticky.nohtml5();
         }

         $(el).closest('.note_common').fadeOut('slow', function(){
            $(el).closest('.note_common').remove();

            if (! $(".note_common").length > 0){
               $('#removenotes').slideUp('slow');
            }

         });
    }
};

// delete all notes
html5sticky.deleteAllNotes = function(){
    if (confirm('Are you sure you want to delete ALL sticky note ?')){
         $('.note_common').fadeOut('slow', function(){
            $('.note_common').remove();
            localStorage.clear();
            $('#removenotes').slideUp('slow');
         });
    }
};


// close big note
html5sticky.closeNote = function(el){
    $(el).closest('.bignote')[html5sticky.getAnimation(true)]('slow', function(){
      $('#overlay').remove();
    });    
};


// get current date and time
html5sticky.getDateTime = function(){
   var currentTime = new Date();
   var month = currentTime.getMonth() + 1;
   var day = currentTime.getDate();
   var year = currentTime.getFullYear();
   var hours = currentTime.getHours();
   var minutes = currentTime.getMinutes();
   var ampm = '';
   var sep = ' ';
   var dsep = '/';
   var tsep = ':';
   
   if (minutes < 10) minutes = "0" + minutes;
   
   if(hours > 11){
      ampm = 'PM';
   } else {
      ampm = 'AM';
   }   

   return month + dsep + day + dsep + year + sep + hours + tsep + minutes + sep + ampm;
   
};

// get ISO 8601 date and time
html5sticky.getISODateTime = function(d){

  function pad(n){return n < 10 ? '0' + n : n}

  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'
};

// edit note
html5sticky.editNote = function($clone, el){
   var ptext = $clone.find('p').html();
   ptext = ptext.replace(/(<br \/>|<br>)/g, '\n');
   $clone.find('p').replaceWith('<textarea class="pedit" />');

   $clone.find('.pedit')
      .val(ptext)
      .css('margin-top', '5px')
      .addClass('inset')
      .width('590px')
      .height('280px');

   // make content editable
   var htext = $clone.find('h2').text();
   $clone.find('h2').replaceWith('<input type="text" class="hedit" />');

   $('.hedit').addClass('inset').val(html5sticky.stripTags(htext, allowed_tags)).width(250);


   // put in Close button
   $('<a href="#" class="close_stickynote"><img src="assets/img/deletebig.png" alt="" title="close note"></a>')
      .css({
         position:'absolute',
         top:7,
         right:5
      })
      .appendTo($clone);

   // put in Save button
   $('<a href="#" class="save_stickynote"><img src="assets/img/savebig.png" alt="" title="save note"></a>')
      .css({
         position:'absolute',
         top:7,
         right:60
      })
      .appendTo($clone);

   // put in Tip
   $('<span class="tip">Tip: Allowed HTML tags: <code>')
      .css({
         position:'absolute',
         bottom:10,
         left:15
      })
      .appendTo($clone);

   var tags = allowed_tags;
   tags = tags.replace('<br />', '');
   // remove ending tags
   tags = tags.match(/<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)/ig);
   $('.tip').text($('.tip').text() + tags.join(' '));

};

// get all notes
html5sticky.getNotes = function(){
   if (Modernizr.localstorage){
      for(var i = 1; i <= max_notes; i++){

         if (localStorage.getItem(i + 'stickynote')){
            //console.log(i + 'stickynote');

            note_index = i;
            var stickynote, bgcolor, htext, ptext, pleft, ptop, temp_array;

            // get color and rotation level
            bgcolor = localStorage.getItem(i + 'stickynote' + '|bgcolor');

            // get position info
            temp_array = localStorage.getItem(i + 'stickynote' + '|pos').split('|');
            pleft = temp_array[0];
            ptop = temp_array[1];

            // get text info
            temp_array = localStorage.getItem(i + 'stickynote' + '|text').split('|');
            htext = temp_array[0];
            ptext = temp_array[1];

            stickynote = $('<div class="note_common ' + bgcolor + '" />').appendTo($('#main'));
            // add tape to stickynote
            html5sticky.addPin(stickynote);

            $(stickynote).append($('<h2>Sticky Note</h2>'));
            $(stickynote).append($('<p>Text here...</p>'));
            // append identifier
            $(stickynote).append($('<span id="idf_' + i + 'stickynote' + '" />'));

            //$(stickynote).find('h2').attr('contentEditable', true);
            //$(stickynote).find('p').attr('contentEditable', true);

            $(stickynote).find('h2').text(html5sticky.stripTags(htext, allowed_tags));
            $(stickynote).find('p').html(html5sticky.stripTags(ptext, allowed_tags));

            // set width and height of the sticky note
            $('.note_common').css({width: stickywidth + 'px', height:stickyheight + 'px'});

            $('.note_common p').css({height:(stickyheight - 60) + 'px', width:(stickywidth + 9) + 'px'});

            // add utility buttons
            //html5sticky.addUtilityButtons(stickynote);

         }
      }

      if (! $('.note_common').length > 0){
         $('#removenotes').hide();
      }

   }
   else {
      html5sticky.nohtml5();
   }
};

// email note
html5sticky.emailNote = function(){

};

// share note
html5sticky.shareNote = function(){

};

// shrink notes
html5sticky.shrink = function(){
   var height = 0 + parseInt($('.note_common:first').find('h2').height(), 10) + 'px';

   $('.note_common').animate({height:height}, function(){
      $('.note_common').find('p').hide();
   });
};

// expand notes
html5sticky.expand = function(){
   $('.note_common').animate({height:stickyheight}, function(){
      $('.note_common').find('p').fadeIn('slow');
   });
};


// share note
html5sticky.showMessage = function(bgcolor, color, msg){
    if (!$('#smsg').is(':visible'))
    {
            $('html, body').animate({
             scrollTop: 0
            }, 500, function(){
                if (!$('#smsg').length)
                {
                    $('<div id="smsg">'+msg+'</div>').appendTo($('body')).css({
                        position:'absolute',
                        top:0,
                        left:3,
                        width:'98%',
                        height:'30px',
                        lineHeight:'30px',
                        background:bgcolor,
                        color:color,
                        zIndex:1000,
                        padding:'10px',
                        fontWeight:'bold',
                        textAlign:'center',
                        opacity:0.9,
                        margin:'auto',
                        display:'none'
                    }).slideDown('show');

                    setTimeout(function(){
                        $('#smsg').animate({'width':'hide'}, function(){
                            $('#smsg').remove();
                        });
                    }, 4000);
                }
            });
    }
};

// get random color
html5sticky.getColor = function(){
    var text = "";
    var possible = "0123456789";

    text += possible.charAt(Math.floor(Math.random() * possible.length));
    return 'stickynote' + text;
};


// get random animation string
html5sticky.getAnimation = function(hideAnimation){
   var words = new Array();

   if (typeof hideAnimation != 'undefined'){
      words[1] = "hide";
      words[2] = "fadeOut";
      words[3] = "slideUp";
   }
   else {
      words[1] = "show";
      words[2] = "fadeIn";
      words[3] = "slideDown";
   }

   // Generate a random number between 1 and 3
   var rnd = Math.ceil(Math.random() * 3);

   return words[rnd];
};


// add pin to note
html5sticky.addPin = function(el){
    var close = $('<div><a href="#" class="delete_stickynote"><img src="assets/img/delete.png" alt="" title="delete note"></a></div>');
    var tag = $('<div align="center"><img src="assets/img/pin.png" alt=""></div>');

    $(close).css({
        position:'absolute',
        top:-15,
        right:-15
    }).prependTo($(el));

    $(tag).css({
        position:'absolute',
        zIndex:99,
        top:-30,
        left:parseInt(stickywidth / 2, 10) - 10
    }).prependTo($(el));
};

// enlarge note for editing
html5sticky.enlargeNote = function(el){
      $this = $(el);

      // get initial position
      var posLeft = parseInt($(el).offset().left, 10);
      var posTop = parseInt($(el).offset().top, 10);

      // create overlay
      $('<div id="overlay" />').css({
         position:'fixed',
         background:'transparent',
         background:'rgba(0,0,0,0.5)',
         top:'0',
         left:'0',
         width:'100%',
         height:'100%',
         zIndex:'100'
      }).appendTo($('body'));

      $clone = $(el).clone().removeClass('note_common').addClass('bignote').appendTo($('#overlay'));
      
      // remove the pin
      $clone.find($('img[src*="pin.png"]').closest('div')).hide();
      // change delete button title
      $clone.find($('img[src*="delete.png"]').closest('div')).hide();

      $($clone).css({
         position:'absolute',
         zIndex: 500,
         cursor:'default',
         paddingTop:'5px',
         top:posTop,
         left:posLeft,
         width:'600px',
         height:'400px',
         top:'50%',
         left:'50%',
         display:'none',
         marginLeft:'-300px',
         marginTop:'-200px'
      });

      $($clone)[html5sticky.getAnimation()](400);

      // add date and time info
      var dateStr = '', dateAgo = '';

      if (Modernizr.localstorage){
         var identifier = html5sticky.getIdentifier($(el));
         var dateTime = localStorage.getItem(identifier + '|dated');
         var timeImg = '<img class="left" align="absmiddle" src="assets/img/time.png">';

         dateStr = dateTime.split('|')[0];
         dateAgo = prettyDate(dateTime.split('|')[1]);

         dateStr = (dateStr.length > 0) ? 'Created on: ' + dateStr : '';
         dateAgo = (dateAgo.length > 0) ? ' (' + dateAgo + ')' : '';
         timeImg = (dateStr.length > 0) ? timeImg : '';
         
      }
      else {
         html5sticky.nohtml5();
      }

      $('<div class="timeago left" />').prependTo($clone);
      $('.timeago').css({fontSize: '12px', fontFamily:'tahoma'}).html(timeImg + '&nbsp;&nbsp;' + dateStr + dateAgo);
      $('.timeago').after('<div class="clear" />');

      // hide the utility buttons
      $($clone).find('.icons-footer').hide();

      // make content editable
      html5sticky.editNote($clone, el);
};

html5sticky.setup = function(){

   var fontFamily = $('.note_common p').css('font-family');

   // Architects font needs to have lesser line height / spacing for lists
   if (typeof fontFamily != 'undefined' && fontFamily.indexOf('Architects') >= 0){
      $('.note_common ul').css({lineHeight:'10px', padding:'0px', margin:'0px'});
      $('.note_common ol').css({lineHeight:'0px', padding:'0px', margin:'0px'});
   }

   // sticky notes can't be less than 200x200
   if (stickywidth < 200){
      stickywidth = 200;
   }

   if (stickyheight < 200){
      stickyheight = 200;
   }

};

// http://phpjs.org/functions/strip_tags:535
html5sticky.stripTags = function(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}


// jQuery Play
$(function(){

    // initial setup
    html5sticky.setup();
   
    // get any saved notes on page load
    html5sticky.getNotes();

    // add note
    $('#addnote').click(function(){
        html5sticky.addNote();
        return false;
    });

    // delete all notes
    $('#removenotes').click(function(){
        html5sticky.deleteAllNotes();
        return false;
    });
    
    // delete note
    $('.delete_stickynote').live('click', function(){
        html5sticky.deleteNote($(this));
        return false;
    });

    // close enlarged note
    $('.close_stickynote').live('click', function(){
        html5sticky.closeNote($(this));
        return false;
    });

    // save the note
    $('.save_stickynote').live('click', function(){
        html5sticky.saveNote($(this));
        return false;
    });


   // enlarge the note
   $(".note_common").live("click", function(event) {
      html5sticky.enlargeNote($(this));
   });

   // shrink the notes
   $('#shrink').click(function(event) {
      html5sticky.shrink();
   });

   // expand the notes
   $('#expand').click(function(event) {
      html5sticky.expand();
   });


   // allow escape to close big note
   $(document).keyup(function(e) {
      if (e.keyCode == "27") {
         $('#overlay').remove();
         $('.bignore').remove();
      }
   });

});

