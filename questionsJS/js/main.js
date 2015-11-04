//jQuery
var main = function() {
  // activate the bootstrap tab
  $('#tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  });
  $('#toggle_advanced').click(function (e) {
    e.preventDefault()
  });
  $('#tab_post').on("hide.bs.collapse", function(){
    $("#toggle_advanced").html('<span class="glyphicon glyphicon-collapse-down"></span> Show advanced options');
  });
  $('#tab_post').on("show.bs.collapse", function(){
    $("#toggle_advanced").html('<span class="glyphicon glyphicon-collapse-up"></span> Hide advanced options');
  });
}

// shift + enter to submit
$('textarea').on('keydown', function(event) {  
  if (event.keyCode == 13)
      if (event.shiftKey)
        $('#btn_post').click(); 
        // use click instead of form submit cuz there is validation on click
});

$(document).ready(main);
