<?php
//FUNCTION TO LOAD WORDPRESS
if ( ! function_exists( 'ngpress_load_wordpress' ) ) :

	function ngpress_load_wordpress() {
		$parse_uri = explode( 'wp-content', $_SERVER['SCRIPT_FILENAME'] );
		require_once( $parse_uri[0] . 'wp-load.php' );
	}

endif;