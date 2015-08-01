<!DOCTYPE html>
<html <?php language_attributes(); ?> data-ng-app="ngPressApp">
<head>
  	<meta charset="<?php bloginfo( 'charset' ); ?>" />
  	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">	
  	<title><?php wp_title('&laquo;', true, 'right'); ?> <?php bloginfo('name'); ?></title>
  	<meta name="author" content="TRM">
  	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<base href="<?php ngpress_basepath(); ?>">
	<?php wp_head();?>
</head>
<body ng-controller="ngPressController as vm" data-ng-class="vm.bodyClass">
<!-- Simple UI Router enabled wp_nav_menu -->
<?php if ( has_nav_menu( 'primary' ) ) : ?>
    <nav id="site-navigation" class="main-navigation" role="navigation">
        <?php
            // Primary navigation menu.
            wp_nav_menu( array(
                'menu_class'     	=> 'nav-menu',
                'theme_location' 	=> 'primary',
                'walker' 			=> new ngpress_walker_nav_menu
            ) );
        ?>
    </nav><!-- .main-navigation -->
<?php 
endif; 

//USER LOGIN/LOGOUT/REGISTER
locate_template( array('templates/user-access.php'), true); 
?>