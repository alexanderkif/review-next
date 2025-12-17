import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DangerZoneProps {
  cleaningImages: boolean;
  clearing: boolean;
  onCleanImages: () => void;
  onClearDatabase: () => void;
}

export default function DangerZone({
  cleaningImages,
  clearing,
  onCleanImages,
  onClearDatabase,
}: DangerZoneProps) {
  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
          <h4 className="font-medium text-slate-800 mb-2">Clean Unused Images</h4>
          <p className="text-sm text-slate-600 mb-3">
            Removes images from storage that are not referenced in the database.
          </p>
          <Button
            onClick={onCleanImages}
            disabled={cleaningImages}
            className="bg-yellow-600"
          >
            {cleaningImages ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Clean Unused Images
              </>
            )}
          </Button>
        </div>

        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <h4 className="font-medium text-slate-800 mb-2">Clear Database</h4>
          <p className="text-sm text-slate-600 mb-3">
            ⚠️ <strong>WARNING:</strong> This will delete ALL data from the database
            except admin users and reset it with sample data. This action CANNOT be
            undone!
          </p>
          <Button
            onClick={onClearDatabase}
            disabled={clearing}
            className="bg-red-600 hover:bg-red-700"
          >
            {clearing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Clear Database
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
