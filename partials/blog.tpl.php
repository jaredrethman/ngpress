<?php
/*
	Template name: Blog
*/

header('Content-Type: text/html');

?>

<data-the-content data-ng-bind="vm.content"></data-the-content>

<data-post-list
    data-posts-per-page="2"
    data-post-type="posts"
>
    <data-post
        data-ng-repeat="post in posts"
    >
        <a data-ui-sref="post({slug:post.slug, id:post.post_id})">
            <h1 data-ng-bind="post.title"></h1>
        </a>
        <div data-ng-bind-html="post.excerpt"></div>
    </data-post>
</data-postlist>