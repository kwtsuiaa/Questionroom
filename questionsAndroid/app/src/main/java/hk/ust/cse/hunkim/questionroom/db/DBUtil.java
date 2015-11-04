package hk.ust.cse.hunkim.questionroom.db;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Created by hunkim on 7/15/15.
 */
public class DBUtil {
    SQLiteOpenHelper helper;

    public DBUtil(SQLiteOpenHelper helper) {
        this.helper = helper;
    }

    public long put(String key) {

        // Gets the data repository in write mode
        SQLiteDatabase db = helper.getWritableDatabase();

        // Create a new map of values, where column names are the keys
        ContentValues values = new ContentValues();
        values.put(DBHelper.KEY_NAME, key);

        return db.insert(
                DBHelper.TABLE_NAME,
                DBHelper.KEY_NAME,
                values);
    }


    public boolean contains(String key) {
        // Gets the data repository in write mode
        SQLiteDatabase db = helper.getReadableDatabase();
        Cursor c = db.rawQuery(
                "SELECT 1 FROM " + DBHelper.TABLE_NAME +
                        " WHERE " + DBHelper.KEY_NAME +
                        " = ?", new String[]{key});

        boolean exists = c.moveToFirst();
        c.close();
        return exists;
    }

    public void delete(String key) {
        // Gets the data repository in write mode
        SQLiteDatabase db = helper.getWritableDatabase();

        // Define 'where' part of query.
        String selection = DBHelper.KEY_NAME + " = ?";
        // Specify arguments in placeholder order.
        String[] selectionArgs = {key};
        // Issue SQL statement.
        db.delete(DBHelper.TABLE_NAME, selection, selectionArgs);
    }
}
