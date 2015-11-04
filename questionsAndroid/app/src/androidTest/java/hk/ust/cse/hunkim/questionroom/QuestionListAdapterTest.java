package hk.ust.cse.hunkim.questionroom;

import hk.ust.cse.hunkim.questionroom.MainActivity;
import hk.ust.cse.hunkim.questionroom.question.Question;

import android.view.LayoutInflater;
import android.view.View;
import android.test.AndroidTestCase;
import android.test.suitebuilder.annotation.MediumTest;

import com.firebase.client.Firebase;


/**
 * Created by CHENZiqi on 2/11/15.
 */
public class QuestionListAdapterTest extends AndroidTestCase {
    QuestionListAdapter qListAdpater;
    String FIREBASE_URL;
    String roomName;
    MainActivity mainActivity;
    Firebase mFirebaseRef;
    View testView;

    public QuestionListAdapterTest() { super(); }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        FIREBASE_URL = "https://comp3111-qroom.firebaseio.com/";
        roomName = "Test";
        mainActivity = new MainActivity();
        LayoutInflater inflater = mainActivity.getLayoutInflater();
        testView = inflater.inflate(R.layout.question, null);

        mFirebaseRef = new Firebase(FIREBASE_URL).child(roomName).child("questions");
        qListAdpater = new QuestionListAdapter(mFirebaseRef.orderByChild("echo").limitToFirst(200), mainActivity, R.layout.question, roomName);
    }

    @MediumTest
    public void testPopulateView() {
        Question question = new Question("test whole msg", "test@email.com");

        qListAdpater.setSelectPostByEmail(true);
        qListAdpater.setInputEmail("test@email.com");
        qListAdpater.populateView(testView, question);
        assertEquals("check post email equal", 0, 0);
    }
}
