# How to Add Images to Your Next.js Application

## Step 1: Download Image Files

### From Unsplash (Recommended)
1. Go to https://unsplash.com
2. Search for "happy customers" or "satisfied clients"
3. Click on an image you like
4. Click the "Download" button
5. Choose size (800x600 is good for web)
6. Save to: `c:\Users\User\Documents\CoupDePouce\frontend\public\images\`
7. Rename file descriptively (e.g., `happy-customer-1.jpg`)

### From Pexels
1. Go to https://www.pexels.com
2. Search for "happy customers"
3. Click on an image
4. Click "Free Download"
5. Save to: `c:\Users\User\Documents\CoupDePouce\frontend\public\images\`

## Step 2: Add Image to Your Code

### Method 1: Basic Image Tag

```tsx
// In your page.tsx file
<img 
  src="/images/happy-customer-1.jpg" 
  alt="Happy customer with completed project"
  className="w-full h-32 object-cover rounded-lg"
/>
```

### Method 2: Image with Error Handling

```tsx
<img 
  src="/images/happy-customer-1.jpg" 
  alt="Happy customer with completed project"
  className="w-full h-32 object-cover rounded-lg mb-4"
  onError={(e) => {
    console.error('Image failed to load:', e);
    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Customer+Image';
  }}
  onLoad={() => console.log('Customer image loaded successfully')}
/>
```

### Method 3: Responsive Image

```tsx
<img 
  src="/images/happy-customer-1.jpg" 
  alt="Happy customer with completed project"
  className="w-full h-32 md:h-48 object-cover rounded-lg mb-4"
  loading="lazy"
/>
```

## Step 3: Update Your Front Page

### Example: Replace Right Image Section

```tsx
{/* Right Image */}
<div className="bg-white rounded-lg shadow-lg p-6">
  <img 
    src="/images/happy-customer-1.jpg" 
    alt="Happy clients with completed projects"
    className="w-full h-32 object-cover rounded-lg mb-4"
    style={{ maxHeight: '128px', objectFit: 'cover' }}
    onError={(e) => {
      console.error('Image failed to load:', e);
      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Client+Image';
    }}
    onLoad={() => console.log('Client image loaded successfully')}
  />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Clients satisfaits
  </h3>
  <p className="text-gray-600 text-sm">
    Rejoignez des milliers de clients qui ont trouvé leur artisan idéal
  </p>
</div>
```

## Step 4: Test Your Image

### In Browser
1. Open your app: http://localhost:3000
2. Check if image displays correctly
3. Open browser console (F12) to see error messages
4. Test on different screen sizes

### Common Issues & Solutions

#### Image Not Displaying
- **Check path**: Make sure it starts with `/images/`
- **Check file**: Verify image is in `public/images/` folder
- **Check spelling**: Ensure filename matches exactly

#### Image Too Large
- **Add height class**: Use `h-32` (128px) or `h-24` (96px)
- **Add object-cover**: Prevents image distortion
- **Add max-height**: `style={{ maxHeight: '128px' }}`

#### Image Loading Slow
- **Add loading="lazy"**: Loads image when needed
- **Optimize size**: Keep images under 200KB
- **Use WebP format**: Better compression

## Step 5: Multiple Images

### Image Gallery Example

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <img 
    src="/images/customer-1.jpg" 
    alt="Happy customer 1"
    className="w-full h-32 object-cover rounded-lg"
  />
  <img 
    src="/images/customer-2.jpg" 
    alt="Happy customer 2"
    className="w-full h-32 object-cover rounded-lg"
  />
  <img 
    src="/images/customer-3.jpg" 
    alt="Happy customer 3"
    className="w-full h-32 object-cover rounded-lg"
  />
</div>
```

## Quick Start Example

### Add This to Your page.tsx

```tsx
// Replace the right image section with this:
{/* Right Image */}
<div className="bg-white rounded-lg shadow-lg p-6">
  <img 
    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop" 
    alt="Happy clients with completed projects"
    className="w-full h-32 object-cover rounded-lg mb-4"
    style={{ maxHeight: '128px', objectFit: 'cover' }}
    onError={(e) => {
      console.error('Image failed to load:', e);
      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Client+Image';
    }}
    onLoad={() => console.log('Client image loaded successfully')}
  />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Clients satisfaits
  </h3>
  <p className="text-gray-600 text-sm">
    Rejoignez des milliers de clients qui ont trouvé leur artisan idéal
  </p>
</div>
```

This uses a copyright-free Unsplash image directly without downloading!
