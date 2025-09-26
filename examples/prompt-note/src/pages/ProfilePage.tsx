/**
 * Profile Page - User profile and settings
 */

import { Component } from "solid-js";
import { Card } from "reynard-primitives";

const ProfilePage: Component = () => {
  return (
    <div class="profile-page">
      <Card padding="lg">
        <h1>Profile Page</h1>
        <p>This page will show user profile information and settings.</p>
      </Card>
    </div>
  );
};

export default ProfilePage;
