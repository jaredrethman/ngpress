<?php
if ( ! function_exists( 'ngpress_scripts' ) ) :

	function ngpress_scripts() {
		// Load main stylesheet.
		
		$theme_td = NGPRESS_PREFIX;
		$theme_ver = wp_get_theme()->get('Version');
				
		wp_enqueue_style( $theme_td . '-style', get_stylesheet_uri(), array(), $theme_ver, null );
		
		//Authentication
		// Leave if WP-API is not activated
		if ( ! defined( 'JSON_API_VERSION' ) )
			//return;
			
		// Leave if not specifically requested from the theme or a plugin
		if ( ! $config = get_theme_support( 'wp-api' ) )
			//return;
		
		// Array of dependencies
		$script_dependencies = null;
		// Data for localization
		$script_data = null;
		
		// Script dependency from theme support
		if ( isset( $config[ 0 ] ) )
			$script_dependencies = $config[ 0 ];
		
		// Script data from theme support
		if ( isset( $config[ 1 ] ) )
			$script_data = $config[ 1 ];
		
		// Data for localization
		//$script_data[ 'base' ] = rest_get_url_prefix() . '/wp/v2';
		
		//$script_data[ 'nonce' ] = wp_create_nonce( 'wp_rest' );
		
		// Provide user id if logged in
		if ( is_user_logged_in() )
			$script_data[ 'user_id' ] = get_current_user_id();
		else
			$script_data[ 'user_id' ] = 0;	
	
		//DEV vs DIST
		if( ngpress_islocalhost() ){
	
			//
			// JS
			//
			if(!is_admin()){
				//Used for livereload when watching *.php files in Grunt task
				wp_enqueue_script( 'livereload', 'http://' . $_SERVER['SERVER_NAME'] . '/livereload.js', '', null, true );
				//Grunt task concat:libs
				wp_enqueue_script( $theme_td . '-libs', get_template_directory_uri() . '/assets/js/' . $theme_td . '-libs.js', array(), $theme_ver, true );
				//Grunt task concat:app
				wp_enqueue_script( 'wp-api',
					get_template_directory_uri() . '/assets/js/' . $theme_td . '-app.js',
					array(), 
					$theme_ver, true 
				);
				
				//
				// CSS
				//
				
				wp_enqueue_style( $theme_td . '-bootstrap', get_stylesheet_directory_uri() . '/assets/css/bootstrap.css', array(), $theme_ver );
				wp_enqueue_style( $theme_td . '-css', get_stylesheet_directory_uri() . '/assets/css/dev.css', array(), $theme_ver, null );	
			}
	
		}else{
			
			//
			// JS + CSS 
			//
			if(!is_admin()){
				//Grunt task concat:dist + uglify
				wp_enqueue_script( 'wp-api',
					get_template_directory_uri() . '/dist/' . $theme_td . '.min.js', 
					array(), 
					$theme_ver, true 
				);
				wp_enqueue_style( $theme_td . '-css', get_stylesheet_directory_uri() . '/dist/' . $theme_td . '.min.css', array(), $theme_ver, null );	
			}
	
		}
		
		if(is_admin()){	
			// Enable the user with no privileges to run ngpress_ajax_login() in AJAX
			add_action( 'wp_ajax_nopriv_ngpressajaxlogin', 'ngpress_ajax_login' );
			// Enable the user with no privileges to run ngpress_ajax_register() in AJAX
			add_action( 'wp_ajax_nopriv_ngpressajaxregister', 'ngpress_ajax_register' );
			// Enable the logged in user to logout
			add_action( 'wp_ajax_ngpressajaxlogout', 'ngpress_ajax_logout' );
		}else{
			//Vars to use in Angular
			//wp_localize_script( 'wp-api', 'WP_API_Settings', array( 'root' => esc_url_raw( rest_url() ), 'nonce' => wp_create_nonce( 'wp_rest' ) ) );
			wp_localize_script('wp-api', 'WP_API_Settings',
				array(
					'wpAjaxUri' => esc_url_raw( admin_url() . 'admin-ajax.php' ), //Need for logins + Registrations
					'root' 		=> rest_url( ) . 'wp/v2/',
					'rootUri'   => get_bloginfo( 'wpurl' ),
					'themeUri'  => get_template_directory_uri(),
					'nonce'		=> wp_create_nonce( 'wp_rest' ),
					'user_id'	=> is_user_logged_in() ? get_current_user_id() : 0,
				)
			);
			wp_localize_script('wp-api', 'configoo',
				array(
					'wpAjaxUri' => esc_url_raw( admin_url() . 'admin-ajax.php' ), //Need for logins + Registrations
					'root' 		=> rest_url() . 'wp/v2/', //Need for logins + Registrations
					'rootUri'   => get_bloginfo( 'wpurl' ),
					'themeUri'  => get_template_directory_uri(),
					'nonce'		=> wp_create_nonce( 'wp_rest' ),
					'user_id'	=> is_user_logged_in() ? get_current_user_id() : 0,
				)
			);
		}
	}
	add_action( 'init', 'ngpress_scripts' );
endif;

