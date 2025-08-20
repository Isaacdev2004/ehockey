"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export function LogoPreview() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo Variants Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Context */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Header Context</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Logo variant="secondary" size="md" />
              <span className="text-lg font-semibold">EHockey League</span>
            </div>
          </div>

          {/* Footer Context */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Footer Context</h3>
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Logo variant="full" size="lg" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 EHockey League. All rights reserved.
              </div>
            </div>
          </div>

          {/* Auth Page Context */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Authentication Page</h3>
            <div className="flex flex-col items-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Logo variant="primary" size="xl" />
              <h2 className="text-2xl font-bold mt-4">Welcome to EHockey</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
            </div>
          </div>

          {/* Compact Context */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Compact Context</h3>
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Logo variant="secondary" size="sm" />
              <span className="text-sm">Quick Navigation</span>
            </div>
          </div>

          {/* All Variants */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">All Logo Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Logo variant="primary" size="md" />
                <span className="text-sm mt-2">Primary (EHOCKEY)</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Logo variant="secondary" size="md" />
                <span className="text-sm mt-2">Secondary (EH)</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Logo variant="full" size="md" />
                <span className="text-sm mt-2">Full (EHOCKEY.NET)</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Logo variant="verified" size="sm" />
                <span className="text-sm mt-2">Verified Badge</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Logo variant="circle" size="md" />
                <span className="text-sm mt-2">Circle</span>
              </div>
            </div>
          </div>

          {/* Size Comparison */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Size Comparison</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex flex-col items-center">
                <Logo variant="secondary" size="sm" />
                <span className="text-xs mt-1">Small</span>
              </div>
              <div className="flex flex-col items-center">
                <Logo variant="secondary" size="md" />
                <span className="text-xs mt-1">Medium</span>
              </div>
              <div className="flex flex-col items-center">
                <Logo variant="secondary" size="lg" />
                <span className="text-xs mt-1">Large</span>
              </div>
              <div className="flex flex-col items-center">
                <Logo variant="secondary" size="xl" />
                <span className="text-xs mt-1">Extra Large</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
