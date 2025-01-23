<script lang="ts">
  import { Motion } from 'svelte-motion';
</script>

<div class="py-24 sm:py-32">
  <div class="container-custom">
    <Motion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      class="max-w-3xl mx-auto"
    >
      <h1 class="heading-1 text-gray-900 mb-8 text-center">About Our Church</h1>
      
      <div class="flex justify-center mb-12">
        <img 
          src="/images/sda-logo.webp" 
          alt="Seventh-day Adventist Church Logo" 
          class="h-32 w-auto"
        />
      </div>

      <div class="prose prose-lg mx-auto">
        <p>
          Welcome to the Rockville-Tolland Seventh-day Adventist Church. We are a vibrant community of believers
          dedicated to sharing God's love and the hope of His soon return. Our church family is committed to
          spiritual growth, fellowship, and service to our local community.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to share the everlasting gospel of Jesus Christ in the context of the Three Angels'
          Messages of Revelation 14, leading people to accept Jesus as their personal Savior and unite with
          His remnant church in preparation for His soon return.
        </p>

        <h2>What We Believe</h2>
        <p>
          As Seventh-day Adventists, we believe in:
        </p>
        <ul>
          <li>The Bible as the inspired Word of God</li>
          <li>Salvation through faith in Jesus Christ</li>
          <li>The Second Coming of Jesus</li>
          <li>The Sabbath as God's holy day of rest and worship</li>
          <li>Wholistic health and wellness</li>
          <li>Service to God and humanity</li>
        </ul>

        <h2>Our Community</h2>
        <p>
          We are blessed to serve the communities of Rockville, Tolland, and surrounding areas. Our church
          offers various programs and ministries for all age groups, providing opportunities for worship,
          fellowship, and spiritual growth.
        </p>

        <h2>Join Us</h2>
        <p>
          Whether you're a long-time Adventist, new to the faith, or simply seeking to learn more about God,
          we welcome you to join us. Our services are designed to be inclusive and meaningful for everyone,
          regardless of where you are in your spiritual journey.
        </p>
      </div>
    </Motion>
  </div>
</div> 