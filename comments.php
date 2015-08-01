<div 
	id="comments" 
    class="comments-area" 
    data-ng-controller="CommentsController"
>
	<h2 data-ng-bind="canComment('<?php echo get_option('comment_registration'); ?>') ? 'Leave a comment:' : 'Comments:'"></h2>
    <div
    	data-comments
        data-ng-if="hasComments"
    >
    	<div 
        	data-comment
            data-ng-if="canShowComment('<?php echo get_option('comment_moderation'); ?>')"
            data-ng-repeat='comment in comments'
        >
        {{comment.content.rendered}}<br />
		- {{comment.author_name}}
        	
        </div>
    </div>
    
    <form 
    	ng-submit="saveComment(CommentForm, $event)" 
        name="CommentForm" 
        id="comment-form"
        
        class="form" 
        data-ng-if="canComment('<?php echo get_option('comment_registration'); ?>')"
  	>
        <div class="form-group">
            <input type="text" id="name" name="name" ng-model="commentData.author_name" placeholder="Name" required/>
            <span ng-show="CommentForm.name.$error.required" class="help-block">Required</span>
        </div>
        <div class="form-group">
            <input type="email" name="email" id="email" ng-model="commentData.author_email" placeholder="Email Address" required />
            <span ng-show="CommentForm.email.$error.required" class="help-block">Required</span>
        </div>
        <div class="form-group">					
            <textarea  required name="comment" ng-model="commentData.content" placeholder="Your Comment..."></textarea><br/>
            <span ng-show="CommentForm.comment.$error.required" class="help-block">Required</span>
        </div>					
        <input class="btn btn-primary" type="submit" value="Add Comment" />
    </form>

</div><!-- .comments-area -->
