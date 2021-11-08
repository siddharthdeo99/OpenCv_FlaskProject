(function ($) {
    "use strict";
    var count = 1;
    var $mySwiper = undefined;

    $(".site-content").fitVids();
    menuWidthHeightFix();
    setToltip();

    //Placeholder show/hide
    $('input, textarea').on('focus', function () {
        $(this).data('placeholder', $(this).attr('placeholder'));
        $(this).attr('placeholder', '');
    });
    $('input, textarea').on('blur', function () {
        $(this).attr('placeholder', $(this).data('placeholder'));
    });

    $(".single-post .entry-info").stick_in_parent({offset_top: 64, parent: ".single-content-wrapper", spacer: ".sticky-spacer"});

    //Fix for Horizontal Slider
    horizontalSliderContentWidth();
    //Gallery Image Slider Fix    
    galleryImage();
    //PrettyPhoto initial    
    setPrettyPhoto();
    //Fix fot Hover Image Slide if no Title
    fixHoverImageNoTitle();
    //Fix Page Split Background Image
    pageSplitBackgroundImage();
    
    $('.contact-form [type="submit"]').on('click',function(){
        SendMail(); 
    });

    //Fix for default menu
    $(".default-menu ul:first").addClass('sm sm-clean main-menu');




    $(window).on('load', function () {

        //Set Carousel Slider
        setUpCarouselSlider();
        //Set Image Slider
        imageSliderSettings();
        // Animate the elemnt if is allready visible on load
        animateElement();
        //Set menu
        setMenu();
        //Blog show feature image
        showFirstBlogPostFeatureImge();
        showBlogPostFeatureImage();

        //Show-Hide header sidebar
        $('#toggle').on("click", multiClickFunctionStop);

        $('.site-content, #toggle').addClass('all-loaded');
        $('.doc-loader').fadeOut();
        $('body').removeClass('wait-preloader');
    });

    $(window).on('resize', function () {
        //Set Carousel Slider
        setUpCarouselSlider();
    });

    $(window).on('scroll', function () {
        animateElement();
    });




//------------------------------------------------------------------------
//Helper Methods -->
//------------------------------------------------------------------------

    function animateElement(e) {
        $(".animate").each(function (i) {
            var top_of_object = $(this).offset().top;
            var bottom_of_window = $(window).scrollTop() + $(window).height();
            if ((bottom_of_window - 70) > top_of_object) {
                $(this).addClass('show-it');
            }
        });
    }
    

    function multiClickFunctionStop(e) {
        e.preventDefault();
        $('#toggle').off("click");
        $('#toggle').toggleClass("on");

        $('html, body, .sidebar, .menu-left-part, .menu-right-part, .site-content').toggleClass("open").delay(500).queue(function (next) {
            $(this).toggleClass("done");
            next();
        });
        $('#toggle').on("click", multiClickFunctionStop);
    }
    


    function showFirstBlogPostFeatureImge() {
        $(".blog-item-holder .entry-holder").first().addClass('active-post');
    }

    function showBlogPostFeatureImage() {
        $(".blog-item-holder .entry-holder").on('mouseenter', function () {
            $(".blog-item-holder .entry-holder").removeClass('active-post');
            $(this).addClass('active-post');
        });
    }

    function menuWidthHeightFix() {
        if (!$(".menu-right-text").length)
        {
            $('#header-main-menu').addClass('no-right-text');
        }
        if (!$("#sidebar").length)
        {
            $('.menu-left-part').addClass('no-sidebar');
        }
    }

    function setToltip() {
        $(".tooltip").tipper({
            direction: "left",
            follow: true
        });
    }

    function is_touch_device() {
        return !!('ontouchstart' in window);
    }

    function setMenu() {
        $('.main-menu').smartmenus({
            subMenusSubOffsetX: 1,
            subMenusSubOffsetY: -8,
            markCurrentItem: true
        });

        var $mainMenu = $('.main-menu').on('click', 'span.sub-arrow', function (e) {
            var obj = $mainMenu.data('smartmenus');
            if (obj.isCollapsible()) {
                var $item = $(this).parent(),
                        $sub = $item.parent().dataSM('sub');
                $sub.dataSM('arrowClicked', true);
            }
        }).bind({
            'beforeshow.smapi': function (e, menu) {
                var obj = $mainMenu.data('smartmenus');
                if (obj.isCollapsible()) {
                    var $menu = $(menu);
                    if (!$menu.dataSM('arrowClicked')) {
                        return false;
                    }
                    $menu.removeDataSM('arrowClicked');
                }
            }
        });
    }

    function setUpCarouselSlider() {
        $('.swiper-wrapper').addClass('no-horizontal-slider');
        if ($('.horizontal-slider').length) {       
            if ($(window).width() >= 1007 && $mySwiper == undefined)
            {                
                $('.swiper-wrapper').removeClass('no-horizontal-slider');
                $mySwiper = new Swiper('.horizontal-slider', {
                    slidesPerView: 'auto',
                    spaceBetween: 0,
                    mousewheel: {
                        releaseOnEdges: true
                    },
                    keyboard: true,
                    simulateTouch: false,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true
                    },
                    freeMode: true

                });
            }

            if ($(window).width() < 1007 && $mySwiper !== undefined)
            {
                $mySwiper.destroy();
                $mySwiper = undefined;
                $('.swiper-wrapper').removeAttr('style').addClass('no-horizontal-slider');
                $('.swiper-slide').removeAttr('style');

            }
        }
    }

    function galleryImage() {
        $(".inverse-black-white .coco-gallery-item").hover(function () {
            $(".inverse-black-white .coco-gallery-item").not(this).addClass('b-w');
        }, function () {
            $(".inverse-black-white .coco-gallery-item").removeClass('b-w');
        });
    }

    function setPrettyPhoto() {
        $('a[data-rel]').each(function () {
            $(this).attr('rel', $(this).data('rel'));
        });
        $("a[rel^='prettyPhoto']").prettyPhoto({
            slideshow: false, /* false OR interval time in ms */
            overlay_gallery: false, /* If set to true, a gallery will overlay the fullscreen image on mouse over */
            default_width: 1280,
            default_height: 720,
            deeplinking: false,
            social_tools: false,
            iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
        });
    }

    function horizontalSliderContentWidth() {
        if ($('.horizontal-slider').length)
        {
            $('.site-content').addClass('has-horizontal-slider');
            $('.portfolio-content').removeClass('content-1170 center-relative');
        }
    }

    function imageSliderSettings() {
        $(".simple-image-slider-wrapper").each(function () {
            var id = $(this).attr('id');
            var auto_value = window[id + '_auto'];
            var speed_value = window[id + '_speed'];
            auto_value = (auto_value === 'true') ? true : false;
            if (auto_value === true)
            {
                var mySwiper = new Swiper('#' + id, {
                    autoplay: {
                        delay: speed_value
                    },
                    slidesPerView: 1,
                    pagination: {
                        el: '.swiper-pagination-' + id,
                        clickable: true
                    }
                });
                $('#' + id).hover(function () {
                    mySwiper.autoplay.stop();
                }, function () {
                    mySwiper.autoplay.start();
                    ;
                });
            } else {
                var mySwiper = new Swiper('#' + id, {
                    slidesPerView: 1,
                    pagination: {
                        el: '.swiper-pagination-' + id,
                        clickable: true
                    }
                });
            }
        });
    }

    function fixHoverImageNoTitle() {
        $(".horizontal-slider .carousel-item-image").each(function () {
            if ($(this).find('h2').text() == '')
            {
                $(this).addClass('no-title-on-slide');
            }
        });
    }

    function pageSplitBackgroundImage() {
        $(".page-split-right").css("background-image", 'url(' + $(".page-split-right").data('background') + ')');
        $(".blog-featured-image-holder").each(function () {
            $(this).css("background-image", 'url(' + $(this).data('background') + ')');
        });
    }

    function isValidEmailAddress(emailAddress) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return pattern.test(emailAddress);
    }

    function SendMail() {

        var emailVal = $('#contact-email').val();

        if (isValidEmailAddress(emailVal)) {
            var params = {
                'action': 'SendMessage',
                'name': $('#name').val(),
                'email': $('#contact-email').val(),
                'subject': $('#subject').val(),
                'message': $('#message').val()
            };
            $.ajax({
                type: "POST",
                url: "php/sendMail.php",
                data: params,
                success: function (response) {
                    if (response) {
                        var responseObj = $.parseJSON(response);
                        if (responseObj.ResponseData)
                        {
                            alert(responseObj.ResponseData);
                        }
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    //xhr.status : 404, 303, 501...
                    var error = null;
                    switch (xhr.status)
                    {
                        case "301":
                            error = "Redirection Error!";
                            break;
                        case "307":
                            error = "Error, temporary server redirection!";
                            break;
                        case "400":
                            error = "Bad request!";
                            break;
                        case "404":
                            error = "Page not found!";
                            break;
                        case "500":
                            error = "Server is currently unavailable!";
                            break;
                        default:
                            error = "Unespected error, please try again later.";
                    }
                    if (error) {
                        alert(error);
                    }
                }
            });
        } else
        {
            alert('Your email is not in valid format');
        }
    }

})(jQuery);