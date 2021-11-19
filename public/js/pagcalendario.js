/*
 * Codigo para pagina calendario
 */

$(document).ready(function() {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    
    /*  className colors
    
    className: default(transparent), important(red), chill(pink), success(green), info(blue)
    
    */		
    
      
    /* initialize the external events
    -----------------------------------------------------------------*/

    $('#external-events div.external-event').each(function() {
    
        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
        };
        
        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject);
        
        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0  //  original position after the drag
        });
        
    });


    /* initialize the calendar
    -----------------------------------------------------------------*/
    
    var calendar =  $('#calendar').fullCalendar({
        header: {
            left: 'title',
            right: 'prev,next today'
        },
        firstDay: 0, //  1(Monday) this can be changed to 0(Sunday) for the USA system
        defaultView: 'month',
        
        axisFormat: 'h:mm',
        columnFormat: {
            month: 'ddd',    // Mon
            week: 'ddd d', // Mon 7
            day: 'dddd M/d',  // Monday 9/7
            agendaDay: 'dddd d'
        },
        titleFormat: {
            month: 'MMMM yyyy', // September 2009
            week: "MMMM yyyy", // September 2009
            day: 'MMMM yyyy'                  // Tuesday, Sep 8, 2009
        },
        allDaySlot: false,

        events: '/emotes/',		
    });
    
    
});