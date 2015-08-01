<div data-ng-controller="UserAccessController">
    
    <?php //LOGOUT
    if ( function_exists('ngpress_ajax_logout') && is_user_logged_in() ): ?>
		<?php wp_nonce_field('ngpress-ajax-logout-nonce', 'logout_security'); ?>
        <a class="submit_button" data-ng-click="logout($event)"><?php _e('Logout','ngpress'); ?></a> 
    <?php endif; ?>  
    
    <?php //LOGIN 
	if ( function_exists('ngpress_ajax_login') && !is_user_logged_in() ): ?>
    <h2><?php _e('Login', 'ngpress'); ?></h2>
        <form id="login" name="loginform" action="login" method="post" data-ng-submit="login(loginform, $event)" role="form">
            <ng-form name="validate">
                <?php wp_nonce_field('ngpress-ajax-login-nonce', 'login_security'); ?>
                <label for="username"><?php _e('Username','ngpress'); ?></label>
                <input id="username" ng-model="loginData.username" type="text" class="required" name="username">
                <label for="password"><?php _e('Password','ngpress'); ?></label>
                <input id="password" ng-model="loginData.password" type="password" class="required" name="password">
                <a class="text-link" href="<?php echo wp_lostpassword_url(); ?>"><?php _e('Lost password?','ngpress'); ?></a>
                <input class="submit_button" type="submit" value="<?php _e('LOGIN','ngpress'); ?>">
            </ng-form>    
        </form>
    <?php endif; ?>    
    
    <?php //REGISTER
    if ( function_exists('ngpress_ajax_register') && get_option('users_can_register') && !is_user_logged_in() ): ?>
    <h2><?php _e('Register', 'ngpress'); ?></h2>
        <form id="register" class="ajax-auth"  action="register" method="post" name="registerform" data-ng-submit="register(registerform, $event)">
            <?php if(isset($virtue['display_login']) && $virtue['display_login'] == '1') : ?>
                <h3><?php _e('Already have an account?','ngpress'); ?> <a id="pop_login"  href=""><?php _e('LOGIN','ngpress'); ?></a></h3><hr />
            <?php endif; ?>
            <ng-form name="validate">
                <?php wp_nonce_field('ngpress-ajax-register-nonce', 'register_security'); ?>         
                <label for="signonname">Username</label>
                <input id="username" type="text" ng-model="registerData.username" name="username" class="required">
                <label for="email">Email</label>
                <input id="email" type="text" ng-model="registerData.email" class="required email" name="email">
                <label for="signonpassword">Password</label>
                <input id="password" type="password" ng-model="registerData.password" class="required" name="password" >
                <label for="password2">Confirm Password</label>
                <input type="password" id="password2" ng-model="registerData.password2" class="required" name="password2">
                <input class="submit_button" type="submit" value="<?php _e('SIGNUP','trm'); ?>">
            </ng-form>     
        </form>
    <?php endif; ?> 
    
    <p ng-bind="status"></p>
    
</div>